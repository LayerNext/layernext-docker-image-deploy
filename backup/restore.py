
import os
import subprocess

import boto3
from dotenv import load_dotenv

load_dotenv(
    '/home/annotation.manager.dev/dataLake-dev/datalake/datalake-nodejs/backup/.env')

AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
AWS_REGION = os.getenv('AWS_REGION')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
KEY = 'LayerNext/dump/2022-12-19/datalake_dump_2022-12-19T00.gz'
FILE_NAME = 'datalake_dump_2022-12-19T00.gz'


session = boto3.session.Session()

s3 = session.resource(
    service_name='s3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

s3_client = session.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

s3_client.download_file(AWS_BUCKET_NAME, KEY, FILE_NAME)


subprocess.call(['bash', f'restore.sh'])
