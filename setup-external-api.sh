#!/bin/bash
#
# Provision the two external API credentials for this tenant.
#
#   ./setup-external-api.sh "ERP integration"
#
# Run from the deploy repo root, after the stacks are up.
#
# ---------------------------------------------------------------------------
# Why this is a wrapper and not a script of its own
#
# Both provisioners already exist, and both already live inside the images this
# box is running:
#
#   datalake_node_backend   scripts/provision-external-bot-api-key.js
#   llm_fast_api_backend    scripts/print_external_api_user_doc.py
#
# Copying them here would mean copying their dependencies too -- the mongodb
# driver for one, utils/constant.py for the other -- and then maintaining a
# second copy of a document format whose only real specification is the code
# that verifies it. When that drifts, nothing fails loudly: the record is
# written, the install looks fine, and authentication refuses every call.
#
# So nothing is copied. Each container runs its own script, against its own
# database, using the credentials already in its own .env. This file only says
# which, and collects what they print.
# ---------------------------------------------------------------------------

set -u

CALLER_NAME="${1:-External integration}"

DATALAKE_COMPOSE="datalake/docker-compose.yml"
CHAT_COMPOSE="chat/docker-compose.yml"

if [ ! -f "$DATALAKE_COMPOSE" ] || [ ! -f "$CHAT_COMPOSE" ]; then
    echo "Run this from the layernext-docker-image-deploy directory."
    exit 1
fi

echo ""
echo "Provisioning external API credentials for: $CALLER_NAME"

# --- datalake ---------------------------------------------------------------
#
# The shipped provisioner hashes the secret, inserts the ApiKey document and
# prints the pair. It refuses a duplicate rather than writing a second one, so
# re-running an install is safe -- and that refusal is not a reason to stop,
# which is why the exit code is reported rather than obeyed.
echo ""
echo "--- datalake -------------------------------------------------------"
docker compose -f "$DATALAKE_COMPOSE" exec -T datalake_node_backend \
    node scripts/provision-external-bot-api-key.js --name "$CALLER_NAME" \
    || echo "  (datalake credential not created -- see the message above)"

# --- chat -------------------------------------------------------------------
#
# The chat script only prints a document; there is no inserter beside it. So
# the document is built here and written with the backend's own mongo manager,
# which finds its connection the same way the application does.
#
# The hashing is imported from the shipped script rather than reimplemented:
# the format has to match what external_api_auth_service verifies, and the one
# place that is guaranteed to stay in step with the verifier is the file that
# ships beside it.
echo ""
echo "--- chat -----------------------------------------------------------"
docker compose -f "$CHAT_COMPOSE" exec -T \
    -e EXTERNAL_API_CALLER_NAME="$CALLER_NAME" \
    llm_fast_api_backend python3 - <<'PY'
import importlib.util
import os
import secrets
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app")

SCRIPT = "/app/scripts/print_external_api_user_doc.py"
if not os.path.isfile(SCRIPT):
    print(f"  {SCRIPT} is not in this image -- nothing to do.")
    raise SystemExit(0)

# Loaded by path: scripts/ is not a package, so a plain import would not find
# it even with /app on the path.
spec = importlib.util.spec_from_file_location("ext_api_doc", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

from databases.mongo_manager import MongoDBmanager

team_id = os.getenv("TEAM_ID", "").strip()
user_id = (os.getenv("ONBOARDED_USER_ID") or os.getenv("SUPER_ADMIN_ID") or "").strip()
name = os.getenv("EXTERNAL_API_CALLER_NAME", "External integration")

if not team_id or not user_id:
    print("  TEAM_ID or ONBOARDED_USER_ID is missing from this container.")
    raise SystemExit(1)

collection = MongoDBmanager("ExternalAPIUsers")

# One active credential per tenant is what an install should leave behind.
# Re-running must not quietly add a second, because both would then work and
# only one would ever be revoked.
existing = collection.get_one_document(
    {"boundUser.teamId": team_id, "isActive": True}
)
if existing:
    print(f"  An active ExternalAPIUsers record already exists "
          f"(apiKeyId {existing.get('apiKeyId')}). Not creating another.")
    raise SystemExit(0)

api_key_id = "ext_" + secrets.token_urlsafe(16)
api_secret = secrets.token_urlsafe(32)
now = datetime.now(timezone.utc).isoformat()

collection.insert_one({
    "apiKeyId": api_key_id,
    "secretHash": module.build_secret_hash(api_secret),
    "isActive": True,
    "revokedAt": None,
    "allowedScopes": [module.DEFAULT_SCOPE],
    "boundUser": {
        "id": user_id,
        "name": name,
        "email": os.getenv("ADMIN_EMAIL", ""),
        # 2 is SUPER_ADMIN, matching the user this tenant was provisioned with.
        "userType": 2,
        "teamId": team_id,
    },
    "createdAt": now,
    "updatedAt": now,
    "lastUsedAt": None,
})

print(f"  apiKeyId:  {api_key_id}")
print(f"  apiSecret: {api_secret}")
PY

echo ""
echo "===================================================================="
echo "  Save the credentials above now. The secrets are hashed in the"
echo "  database and cannot be read back -- only replaced."
echo "===================================================================="
echo ""
