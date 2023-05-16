## PIP install

* Check pip version
```sh
pip --version
```

* pip install if not available,
```sh
sudo apt-get install python3-pip
```
* Check if psutill exists
```sh
pip list | grep psutil
```

* If package is not available, install psutil.
```sh
pip install psutil
```

## .env file

```sh
SERVER_NAME = <Server name>
EMAIL_PASS = <Email password>
SENDER_EMAIL  = <sender email address>
```

## Configurations

Configurations can be found in `main.py`.

```sh
MEMORY_THRESHOLD_PERCENTAGE = 70
DISK_THRESHOLD_PERCENTAGE = 75
LOAD_AVERAGE_THRESHOLD = 2
PERCENTAGE_90 = 90
DEFAULT_EMAILS = [<email address>]
```
## Run Cronjob 

* Edit crontab 
```sh
crontab -e
``` 
* Run the cron job at a desired time interval.
```sh
* * * * * python3 <path>/main.py >>  <path>/output.log 2>&1
```
* For an example,
```sh
*/5 * * * * python3 vps-pro-dev/backend/vps-pro-backend/server-alert/main.py >> vps-pro-dev/backend/vps-pro-backend/server-alert/output.log 2>&1)
```
* Output logs can be found in `output.log`.



