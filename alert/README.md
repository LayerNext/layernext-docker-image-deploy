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
#email configurations
EMAIL_PASS=<sender email password>
SENDER_EMAIL=<sender email address>

#server configurations
SERVER_NAME=<server name>
MEMORY_THRESHOLD_PERCENTAGE=70
DISK_THRESHOLD_PERCENTAGE=90
LOAD_AVERAGE_THRESHOLD=2
PERCENTAGE_90=90
```

## Configurations

Configurations can be found in `alert.py`.

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
* * * * * python3 <path>/alert.py >>  <path>/output.log 2>&1
```
* For an example,
```sh
*/5 * * * * python3 /home/ubuntu/layernext-dev/layerx-docker-image-deploy/alert/alert.py  >>  /home/ubuntu/layernext-dev/layerx-docker-image-deploy/alert/output.log 2>&1
```
* Output logs can be found in `output.log`.



