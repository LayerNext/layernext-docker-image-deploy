#!/bin/bash
#
# Provision this tenant's external API credential.
#
#   ./setup-external-api.sh "ERP integration"
#
# Run from the deploy repo root, after the stacks are up. Needs python3 on this
# host (it is on every LayerNext server: the installer is python).
#
# ONE credential, valid on both APIs: one apiKeyId (ext_...) and one secret,
# stored in both databases, each as the hash that backend verifies:
#
#   chat      chatDB.ExternalAPIUsers    secretHash = PBKDF2-SHA256(secret)
#   datalake  datalakeDB.ApiKey          secretHash = scrypt(secret)
#
# The caller sends the same header to either:
#
#   Authorization: Basic base64(<apiKeyId>:<apiSecret>)
#
# Only the hashes are stored. The secret is printed once, here, and cannot be
# read back afterwards -- only replaced.
#
# ---------------------------------------------------------------------------
# Where the hashing lives
#
# Both hashes are computed here, on the host, so the secret itself never enters
# a container -- not on a command line, not on stdin. Only the hashes are sent
# to the backends, which store them.
#
# The two functions below are copies of the ones in the images, and must stay
# byte-for-byte compatible with what each backend verifies:
#
#   chat      LLM-integration/scripts/print_external_api_user_doc.py
#               build_secret_hash()
#             verified by services/external_api_auth_service.py verify_secret()
#
#   datalake  datalake-nodejs/scripts/provision-external-bot-api-key.js
#               hashSecret()   (print-external-bot-api-key-doc.js uses the same)
#             verified by src/authServices/external-bot-api-key.strategy.ts
#
# If either backend changes its hash format, change it here too: nothing would
# fail at this point -- the record is written, and authentication then refuses
# every call.
#
# Order, and why:
#   1. chat: refuse if this team already has an active credential. Its secret
#      cannot be read back, so it cannot be reused for datalake, and a second
#      one would leave two in use.
#   2. here: generate the key and secret, and both hashes.
#   3. chat: insert the chat hash.
#   4. datalake: insert the datalake hash.
#   5. if 4 fails, remove what 3 inserted -- a credential that works on one
#      API only could never be completed, because the secret is gone.
# ---------------------------------------------------------------------------

set -u

CALLER_NAME="${1:-External integration}"

DATALAKE_COMPOSE="datalake/docker-compose.yml"
CHAT_COMPOSE="chat/docker-compose.yml"

if [ ! -f "$DATALAKE_COMPOSE" ] || [ ! -f "$CHAT_COMPOSE" ]; then
    echo "Run this from the layernext-docker-image-deploy directory."
    exit 1
fi
if ! command -v python3 > /dev/null 2>&1; then
    echo "python3 is needed on this host to generate the credential."
    exit 1
fi

# A program for a backend container, read from stdin. Both streams are kept,
# so a failure -- a container that is not running -- says why.
chat_python() {
    docker compose -f "$CHAT_COMPOSE" exec -T \
        -e EXTERNAL_API_CALLER_NAME="$CALLER_NAME" \
        llm_fast_api_backend python3 - 2>&1
}
datalake_node() {
    docker compose -f "$DATALAKE_COMPOSE" exec -T \
        -e EXTERNAL_API_CALLER_NAME="$CALLER_NAME" \
        datalake_node_backend node - 2>&1
}

# The backends log to stdout, so each step reports on a line of its own,
# prefixed RESULT=, and only that line is read.
result_of() {
    printf '%s\n' "$1" | sed -n 's/^RESULT=//p' | tail -n 1
}

echo ""
echo "Provisioning the external API credential for: $CALLER_NAME"

# --- 1: does this team already have one? ---------------------------------------------
CHECK_OUTPUT=$(chat_python <<'PY'
import os
import sys

sys.path.insert(0, "/app")
from databases.mongo_manager import MongoDBmanager

team_id = os.getenv("TEAM_ID", "").strip()
user_id = (os.getenv("ONBOARDED_USER_ID") or os.getenv("SUPER_ADMIN_ID") or "").strip()
if not team_id or not user_id:
    print("RESULT=NO-IDS")
    raise SystemExit(0)

existing = MongoDBmanager("ExternalAPIUsers").get_one_document(
    {"boundUser.teamId": team_id, "isActive": True}
)
print(f"RESULT=EXISTS {existing.get('apiKeyId')}" if existing else "RESULT=NONE")
PY
)
CHECK=$(result_of "$CHECK_OUTPUT")

case "$CHECK" in
    NONE)
        ;;
    EXISTS\ *)
        echo ""
        echo "  This tenant already has an active credential (apiKeyId ${CHECK#EXISTS })."
        echo "  Nothing was created. Its secret cannot be read back; to replace it, set"
        echo "  isActive to false on it in chat (ExternalAPIUsers) and in datalake (ApiKey),"
        echo "  then run this again."
        exit 0
        ;;
    NO-IDS)
        echo "  TEAM_ID or ONBOARDED_USER_ID is missing from the chat container. Nothing was created."
        exit 1
        ;;
    *)
        echo "  Could not check the chat database. Nothing was created."
        printf '%s\n' "$CHECK_OUTPUT" | sed 's/^/    /'
        exit 1
        ;;
esac

# --- 2: the key, the secret, and both hashes -------------------------------------------
GENERATED=$(python3 - <<'PY'
import base64
import hashlib
import os
import secrets

# The pair. Neither contains ':' -- the separator in Basic base64(id:secret).
api_key_id = "ext_" + secrets.token_urlsafe(16)
api_secret = secrets.token_urlsafe(32)


def chat_hash(secret, iterations=260_000):
    """print_external_api_user_doc.py build_secret_hash(), unchanged."""
    salt = secrets.token_urlsafe(16)
    derived = hashlib.pbkdf2_hmac("sha256", secret.encode("utf-8"), salt.encode("utf-8"), iterations)
    digest_b64 = base64.b64encode(derived).decode("utf-8")
    return f"pbkdf2_sha256${iterations}${salt}${digest_b64}"


def datalake_hash(secret):
    """provision-external-bot-api-key.js hashSecret(): Node's scryptSync with its
    defaults -- N=16384, r=8, p=1 -- a 16-byte salt and a 64-byte key."""
    salt = os.urandom(16)
    derived = hashlib.scrypt(secret.encode("utf-8"), salt=salt, n=16384, r=8, p=1, dklen=64)
    return f"{salt.hex()}:{derived.hex()}"


print(api_key_id, api_secret, chat_hash(api_secret), datalake_hash(api_secret))
PY
)
read -r API_KEY_ID API_SECRET CHAT_HASH DATALAKE_HASH <<<"$GENERATED"

# All four go into program text below. Checked against their exact shapes.
valid() { printf '%s' "$1" | grep -Eq "$2"; }
if ! valid "$API_KEY_ID"    '^ext_[A-Za-z0-9_-]{22}$' \
|| ! valid "$API_SECRET"    '^[A-Za-z0-9_-]{43}$' \
|| ! valid "$CHAT_HASH"     '^pbkdf2_sha256\$260000\$[A-Za-z0-9_-]+\$[A-Za-z0-9+/]+=*$' \
|| ! valid "$DATALAKE_HASH" '^[0-9a-f]{32}:[0-9a-f]{128}$'; then
    echo "  The credential could not be generated on this host. Nothing was created."
    exit 1
fi

# --- 3: chat ----------------------------------------------------------------------------
INSERT_OUTPUT=$(
    {
        printf 'API_KEY_ID = "%s"\nSECRET_HASH = "%s"\n' "$API_KEY_ID" "$CHAT_HASH"
        cat <<'PY'
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app")
from databases.mongo_manager import MongoDBmanager

# The document print_external_api_user_doc.py builds, with its default scope.
now = datetime.now(timezone.utc).isoformat()
MongoDBmanager("ExternalAPIUsers").insert_one({
    "apiKeyId": API_KEY_ID,
    "secretHash": SECRET_HASH,
    "isActive": True,
    "revokedAt": None,
    "allowedScopes": ["conversation:access"],
    "boundUser": {
        "id": (os.getenv("ONBOARDED_USER_ID") or os.getenv("SUPER_ADMIN_ID") or "").strip(),
        "name": os.getenv("EXTERNAL_API_CALLER_NAME", "External integration"),
        "email": os.getenv("ADMIN_EMAIL", ""),
        # 2 is SUPER_ADMIN, matching the user this tenant was provisioned with.
        "userType": 2,
        "teamId": os.getenv("TEAM_ID", "").strip(),
    },
    "createdAt": now,
    "updatedAt": now,
    "lastUsedAt": None,
})
print("RESULT=INSERTED")
PY
    } | chat_python
)
if [ "$(result_of "$INSERT_OUTPUT")" != INSERTED ]; then
    echo "  The chat record could not be written. Nothing was created."
    printf '%s\n' "$INSERT_OUTPUT" | sed 's/^/    /'
    exit 1
fi
echo "  chat:     ExternalAPIUsers record written"

# --- 4: datalake --------------------------------------------------------------------------
# The connection the provisioner uses: the container's DB_* settings, from its
# environment or its .env. Refuses a key that is already there.
DATALAKE_OUTPUT=$(
    {
        printf 'const API_KEY_ID = "%s";\nconst SECRET_HASH = "%s";\n' "$API_KEY_ID" "$DATALAKE_HASH"
        cat <<'JS'
const path = require('path');
try {
  require('dotenv').config({path: path.resolve(process.cwd(), '.env')});
} catch (e) {
  // the container environment already carries the settings
}
const {MongoClient} = require('mongodb');

(async () => {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '37017';
  const user = process.env.DB_USER;
  const database = process.env.DATABASE;
  if (!host || !user || !database) {
    console.log('RESULT=ERROR DB_HOST, DB_USER or DATABASE is not set in this container');
    return;
  }
  const password = encodeURIComponent(process.env.DB_PASS || '');
  const client = new MongoClient(
    `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=${database}`,
  );
  try {
    await client.connect();
    const collection = client.db(database).collection('ApiKey');
    if (await collection.findOne({key: API_KEY_ID, application: 'external-bot'})) {
      console.log(`RESULT=ERROR an ApiKey with key ${API_KEY_ID} already exists`);
      return;
    }
    // The document provision-external-bot-api-key.js builds.
    const result = await collection.insertOne({
      key: API_KEY_ID,
      application: 'external-bot',
      name: (process.env.EXTERNAL_API_CALLER_NAME || 'External integration').trim(),
      secretHash: SECRET_HASH,
      isActive: true,
    });
    console.log(`RESULT=INSERTED ${result.insertedId}`);
  } catch (error) {
    console.log(`RESULT=ERROR ${error.message}`);
  } finally {
    await client.close();
  }
})();
JS
    } | datalake_node
)
DATALAKE=$(result_of "$DATALAKE_OUTPUT")

if [ "${DATALAKE%% *}" != INSERTED ]; then
    echo "  datalake: the ApiKey record could not be written:"
    printf '%s\n' "$DATALAKE_OUTPUT" | sed 's/^RESULT=ERROR /  /; s/^/    /'

    # --- 5: undo 3 ---------------------------------------------------------------------------
    UNDO_OUTPUT=$(
        {
            printf 'API_KEY_ID = "%s"\n' "$API_KEY_ID"
            cat <<'PY'
import sys
sys.path.insert(0, "/app")
from databases.mongo_manager import MongoDBmanager
MongoDBmanager("ExternalAPIUsers").remove_many({"apiKeyId": API_KEY_ID})
print("RESULT=REMOVED")
PY
        } | chat_python
    )
    if [ "$(result_of "$UNDO_OUTPUT")" = REMOVED ]; then
        echo "  chat:     the record written above was removed again. Nothing was created."
    else
        echo "  chat:     could NOT remove the record written above -- remove it by hand:"
        echo "            db.ExternalAPIUsers.deleteOne({apiKeyId: \"$API_KEY_ID\"})"
    fi
    exit 1
fi
echo "  datalake: ApiKey record written (_id ${DATALAKE#INSERTED })"

# --- the credential, once -------------------------------------------------------------------
AUTH_HEADER="Basic $(printf '%s:%s' "$API_KEY_ID" "$API_SECRET" | base64 | tr -d '\n')"

echo ""
echo "--- credential (chat + datalake) -----------------------------------"
echo "  apiKeyId:            $API_KEY_ID"
echo "  apiSecret:           $API_SECRET"
echo "  authorizationHeader: $AUTH_HEADER"
echo ""
echo "  Valid on the chat conversation API and the datalake master-data-sync API."
echo ""
echo "===================================================================="
echo "  Save the credential above now. The secret is hashed in both"
echo "  databases and cannot be read back -- only replaced."
echo "===================================================================="
echo ""
