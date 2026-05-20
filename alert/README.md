## PIP install

- Check pip version

```sh
pip --version
```

- pip install if not available,

```sh
sudo apt-get install python3-pip
```

- Check if psutill exists

```sh
pip list | grep psutil
```

- If package is not available, install psutil.

```sh
pip install psutil
pip install boto3
```

## .env file

```sh
MEMORY_THRESHOLD_PERCENTAGE = 70
DISK_THRESHOLD_PERCENTAGE = 75
LOAD_AVERAGE_THRESHOLD = 2
PERCENTAGE_90 = 90
DEFAULT_EMAILS = [<email address>]
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION (defaults to us-east-1 if omitted)
SENDER_EMAIL (must be verified in SES)
SERVER_NAME
```

## Configurations

Configurations can be found in `alert.py`.

```sh
MEMORY_THRESHOLD_PERCENTAGE = 70
DISK_THRESHOLD_PERCENTAGE = 75
LOAD_AVERAGE_THRESHOLD = 2
PERCENTAGE_90 = 90
DEFAULT_EMAILS = [<email address>]
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION (defaults to us-east-1 if omitted)
SENDER_EMAIL (must be verified in SES)
SERVER_NAME
```

## Run Cronjob

- Edit crontab

```sh
crontab -e
```

- Run the cron job at a desired time interval.

```sh
* * * * * python3 <path>/alert.py >>  <path>/output.log 2>&1
```

- For an example,

```sh
*/5 * * * * python3 /home/ubuntu/layernext-dev/layernext-docker-image-deploy/alert/alert.py  >>  /home/ubuntu/layernext-dev/layernext-docker-image-deploy/alert/output.log 2>&1
```

- Output logs can be found in `output.log`.
