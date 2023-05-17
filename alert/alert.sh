
# configure crontab
PATH_DIR=$(realpath .)
(crontab -l 2>/dev/null; echo "*/5 * * * * python3 $PATH_DIR/alert.py  >>  $PATH_DIR/output.log 2>&1") | crontab -


# generate alert env
alert_env="./.env"
if [ -f $alert_env ]; then
  echo "Existing env file found for alert. replacing..."
fi
cat > $alert_env <<EOL
#email configurations
EMAIL_PASS=yuchpcpqpfcxxlbb
SENDER_EMAIL=support@layerx.ai

#server configurations
SERVER_NAME=Layerx-Dev
MEMORY_THRESHOLD_PERCENTAGE=70
DISK_THRESHOLD_PERCENTAGE=90
LOAD_AVERAGE_THRESHOLD=2
PERCENTAGE_90=90
EOL