import datetime
import math
import os
import subprocess
import sys

import boto3
from dotenv import load_dotenv

PATH_ENV = sys.argv[1]
PATH_DIR = sys.argv[2]

load_dotenv(PATH_ENV)
OUTPUT_DIRECTORY = os.getenv("OUTPUT_DIRECTORY")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
DUMP_KEEPING_DAYS = os.getenv("DUMP_KEEPING_DAYS")
DUMP_PER_DAY = os.getenv("DUMP_PER_DAY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
RECEIVER_EMAILS = os.getenv("RECEIVER_EMAILS").split(",")
COMPANY = os.getenv("COMPANY")

date = datetime.datetime.now()
hour_gap = math.ceil(24 / int(DUMP_PER_DAY))
if hour_gap == 0:
    hour_gap = 1

hour_list = [0]
temp_hour = 0
while temp_hour < 24:
    temp_hour += hour_gap
    if temp_hour <= 24:
        hour_list.append(int(temp_hour))

year = date.year
month = date.month
if month < 10:
    month = f"0{str(month)}"
day = date.day
if day < 10:
    day = f"0{str(day)}"
hour = date.hour
if hour < 10:
    hour = f"0{str(hour)}"

int_hour = int(date.hour)


def dump_mongdb():

    file_name = f"{OUTPUT_DIRECTORY}_{year}-{month}-{day}T{hour}.gz"
    file_location = f"{PATH_DIR}/backup/{OUTPUT_DIRECTORY}/dump/{file_name}"
    date_string = f"{year}-{month}-{day}"
    print(file_location)

    subprocess.call(
        ["bash", f"{PATH_DIR}/backup/dump.sh", f"{PATH_ENV}", f"{PATH_DIR}"]
    )

    try:
        session = boto3.session.Session()

        s3 = session.resource(
            service_name="s3",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
        )

        s3_client = session.client(
            "s3",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
        )

        print(
            "paths: ",
            file_location,
            AWS_BUCKET_NAME,
            f"LayerNext/dump/{OUTPUT_DIRECTORY}/{date_string}/{file_name}",
        )

        s3_client.upload_file(
            file_location,
            AWS_BUCKET_NAME,
            f"LayerNext/dump/{OUTPUT_DIRECTORY}/{date_string}/{file_name}",
        )

        response = s3_client.list_objects_v2(
            Bucket=AWS_BUCKET_NAME, Prefix=f"LayerNext/dump/{OUTPUT_DIRECTORY}"
        )

        expire_date = datetime.datetime.now() - datetime.timedelta(
            int(DUMP_KEEPING_DAYS)
        )
        expire_month = expire_date.month
        expire_day = expire_date.day

        if expire_month < 10:
            expire_month = f"0{str(expire_month)}"
        if expire_day < 10:
            expire_day = f"0{str(expire_day)}"

        delete_list = []
        keep_list = []
        for object in response["Contents"]:
            key = object["Key"]
            key_list = key.split("/")
            date = key_list[3]
            if datetime.datetime.fromisoformat(date) < expire_date:
                print("Deleting", object["Key"])
                delete_list.append(object["Key"])
            else:
                keep_list.append(object["Key"])

        if len(keep_list) > ((int(DUMP_KEEPING_DAYS) - 1) * int(DUMP_PER_DAY)):
            for key in delete_list:
                s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=key)
                print("file deleted from s3", key)

        # print(DUMP_KEEPING_DAYS, DUMP_PER_DAY, hour_list, int_hour)
        print("dump finished...")

        os.unlink(file_location)

        send_email(
            subject=f"MongoDB Dump Of {COMPANY} - {date_string}",
            body=f"The MongoDB dump for {date_string} has been successfully created and uploaded to S3.",
        )

    except Exception as e:
        print("An error occurred:", str(e))
        send_email(
            subject=f"MongoDB Dump Failed for {COMPANY} - {date_string}",
            body=f"An error occurred while creating the MongoDB dump for {date_string}. Error details: {str(e)}",
        )


if int_hour not in hour_list:
    print("it is not in the list")
    dump_mongdb()
else:
    print("it is in the list")
    dump_mongdb()


def send_email(subject, body):
    ses_client = boto3.client(
        "ses",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
    )

    for email in RECEIVER_EMAILS:
        response = ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={
                "ToAddresses": [
                    email,
                ]
            },
            Message={"Subject": {"Data": subject}, "Body": {"Text": {"Data": body}}},
        )

        print(f'Email sent to {email} with Message ID: {response["MessageId"]}')
