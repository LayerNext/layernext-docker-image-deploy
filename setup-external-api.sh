#!/bin/bash
#
# Provision this tenant's external API credential.
#
#   ./setup-external-api.sh "ERP integration"
#
# Run from the deploy repo root, after the stacks are up.
#
# ONE credential, valid on both APIs: one apiKeyId (ext_...) and one secret,
# stored in both databases, each as that backend's own hash of the secret:
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
# Why this is a wrapper and not a script of its own
#
# Both hashing schemes already exist, inside the images this box is running:
#
#   llm_fast_api_backend    scripts/print_external_api_user_doc.py
#   datalake_node_backend   scripts/provision-external-bot-api-key.js
#
# Copying them here would mean maintaining a second copy of a format whose only
# real specification is the code that verifies it. When that drifts, nothing
# fails loudly: the record is written, and authentication refuses every call.
# So each container hashes the secret with its own code, against its own
# database, using the connection already in its own .env. This file generates
# the pair once, hands it to both, and prints it.
#
# Order, and why:
#   1. chat: refuse if this team already has an active credential. Its secret
#      cannot be read back, so it cannot be reused for datalake, and a second
#      one would leave two in use.
#   2. chat: generate the key and secret.
#   3. chat: insert, with chat's hash.
#   4. datalake: insert the same key and secret, with datalake's hash.
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

# Python in the chat backend, reading its program from stdin. Values that must
# stay out of the process list go in on stdin too, never as arguments. Both
# streams are kept, so a failure -- a container that is not running -- says why.
chat_python() {
    docker compose -f "$CHAT_COMPOSE" exec -T \
        -e EXTERNAL_API_CALLER_NAME="$CALLER_NAME" \
        llm_fast_api_backend python3 - 2>&1
}

# The chat backend logs to stdout, so each step reports on a line of its own,
# prefixed RESULT=, and only that line is read.
result_of() {
    printf '%s\n' "$1" | sed -n 's/^RESULT=//p' | tail -n 1
}

echo ""
echo "Provisioning the external API credential for: $CALLER_NAME"

# --- 1 and 2: check chat, and generate the pair -----------------------------------
CHECK_OUTPUT=$(chat_python <<'PY'
import os
import secrets
import sys

sys.path.insert(0, "/app")
if not os.path.isfile("/app/scripts/print_external_api_user_doc.py"):
    print("RESULT=NO-SCRIPT")
    raise SystemExit(0)

from databases.mongo_manager import MongoDBmanager

team_id = os.getenv("TEAM_ID", "").strip()
user_id = (os.getenv("ONBOARDED_USER_ID") or os.getenv("SUPER_ADMIN_ID") or "").strip()
if not team_id or not user_id:
    print("RESULT=NO-IDS")
    raise SystemExit(0)

existing = MongoDBmanager("ExternalAPIUsers").get_one_document(
    {"boundUser.teamId": team_id, "isActive": True}
)
if existing:
    print(f"RESULT=EXISTS {existing.get('apiKeyId')}")
    raise SystemExit(0)

# Neither contains ':' -- the separator in Basic base64(apiKeyId:apiSecret).
print(f"RESULT=OK ext_{secrets.token_urlsafe(16)} {secrets.token_urlsafe(32)}")
PY
)
CHECK=$(result_of "$CHECK_OUTPUT")

case "$CHECK" in
    OK\ *)
        read -r _ API_KEY_ID API_SECRET <<<"$CHECK"
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
    NO-SCRIPT)
        echo "  scripts/print_external_api_user_doc.py is not in the chat image. Nothing was created."
        exit 1
        ;;
    *)
        echo "  Could not check the chat database. Nothing was created."
        printf '%s\n' "$CHECK_OUTPUT" | sed 's/^/    /'
        exit 1
        ;;
esac

# Both go into python source and onto a command line below. Checked, not trusted.
case "$API_KEY_ID$API_SECRET" in
    *[!A-Za-z0-9_-]*|"")
        echo "  The generated credential has unexpected characters. Nothing was created."
        exit 1
        ;;
esac

# --- 3: chat, with chat's hash ------------------------------------------------------
INSERT_OUTPUT=$(
    {
        printf 'API_KEY_ID = "%s"\nAPI_SECRET = "%s"\n' "$API_KEY_ID" "$API_SECRET"
        cat <<'PY'
import importlib.util
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app")

# Loaded by path: scripts/ is not a package. Its hash is the format
# external_api_auth_service verifies, so it is used, not reimplemented.
spec = importlib.util.spec_from_file_location("ext_api_doc", "/app/scripts/print_external_api_user_doc.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

from databases.mongo_manager import MongoDBmanager

now = datetime.now(timezone.utc).isoformat()
MongoDBmanager("ExternalAPIUsers").insert_one({
    "apiKeyId": API_KEY_ID,
    "secretHash": module.build_secret_hash(API_SECRET),
    "isActive": True,
    "revokedAt": None,
    "allowedScopes": [module.DEFAULT_SCOPE],
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

# --- 4: datalake, the same pair with datalake's hash ----------------------------------
# The shipped provisioner takes the pair as arguments; it refuses a key that is
# already there, so a repeat cannot write a second record. Its own output
# repeats the secret, so it is kept, not printed, unless something goes wrong.
DATALAKE_OUTPUT=$(docker compose -f "$DATALAKE_COMPOSE" exec -T datalake_node_backend \
    node scripts/provision-external-bot-api-key.js \
    --name "$CALLER_NAME" --key "$API_KEY_ID" --secret "$API_SECRET" 2>&1)
DATALAKE_STATUS=$?

if [ "$DATALAKE_STATUS" -ne 0 ] || ! printf '%s\n' "$DATALAKE_OUTPUT" | grep -q "Inserted ApiKey document"; then
    echo "  datalake: the ApiKey record could not be written:"
    printf '%s\n' "$DATALAKE_OUTPUT" | grep -v -e "$API_SECRET" | sed 's/^/    /'

    # --- 5: undo 3 ---------------------------------------------------------------------
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
DATALAKE_ID=$(printf '%s\n' "$DATALAKE_OUTPUT" | sed -n 's/^Inserted ApiKey document _id=//p')
echo "  datalake: ApiKey record written (_id $DATALAKE_ID)"

# --- 6: the credential, once ---------------------------------------------------------
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
