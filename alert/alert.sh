pip --version
sudo apt-get install python3-pip
pip list | grep psutil
pip install psutil

variable1=$1
variable2=$2
variable3=$3

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
EMAIL_PASS=$variable3
SENDER_EMAIL=$variable2

#server configurations
SERVER_NAME=LayerNext-$variable1
MEMORY_THRESHOLD_PERCENTAGE=70
DISK_THRESHOLD_PERCENTAGE=75
LOAD_AVERAGE_THRESHOLD=2
PERCENTAGE_90=90
EOL