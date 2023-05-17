import os
import smtplib
import datetime
import socket
import psutil
from dotenv import load_dotenv

load_dotenv()

SERVER_NAME = os.getenv('SERVER_NAME')

MEMORY_THRESHOLD_PERCENTAGE = int(os.getenv('MEMORY_THRESHOLD_PERCENTAGE'))
DISK_THRESHOLD_PERCENTAGE = int(os.getenv('DISK_THRESHOLD_PERCENTAGE'))
LOAD_AVERAGE_THRESHOLD = int(os.getenv('LOAD_AVERAGE_THRESHOLD'))
PERCENTAGE_90 = int(os.getenv('PERCENTAGE_90'))
DEFAULT_EMAILS = ["chathushka@zoomi.ca", "channa@zoomi.ca", "kelum@zoomi.ca", "isuru@zoomi.ca"]


def get_details():
    return socket.gethostname()


""""
    This function is used to print the output message with a timestamp
"""


def print_with_timestamp(output_message):
    now = datetime.datetime.now()
    timestamped_message = f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] {output_message}"
    print(timestamped_message)


""""
    This function is used to send an email to the default email addresses
"""


def send_email(subject, body):
    for email in DEFAULT_EMAILS:
        # establish a secure SMTP connection
        smtp_server = "smtp.gmail.com"
        port = 587
        sender_password = os.getenv('EMAIL_PASS')
        sender_email = os.getenv('SENDER_EMAIL')

        server = smtplib.SMTP(smtp_server, port)
        server.starttls()
        server.login(sender_email, sender_password)

        # send the email
        message = f"Subject: {subject}\n\n{body}"
        server.sendmail(sender_email, email, message)
        server.quit()


"""
    This function is used to display the disk usage details
"""


def display_disk_usage(host_name):
    disk = psutil.disk_usage(os.path.realpath('/'))
    details = "SERVER HOST NAME :  " + host_name + "\n\nUsed disk percentage: " + str(
        disk.percent) + "%\n\nTotal disk space :    " + str(
        disk.total // (2 ** 30)) + " GB\nUsed disk space :    " + str(
        disk.used // (2 ** 30)) + " GB\nFree disk space :     " + str(disk.free // (2 ** 30)) + " GB"
    return disk.percent, details


""""
    This function is used to display the memory usage details
"""


def display_memory_usage(host_name):
    mem_stats = psutil.virtual_memory()
    mem_utilization = mem_stats.percent
    details = "SERVER HOST NAME :  " + host_name + "\n\nMemory utilization: " + str(
        mem_utilization) + " %\n\nTotal memory: " + str(
        round(mem_stats.total / (1024 ** 3), 2)) + " GB\nUsed memory: " + str(
        round(mem_stats.used / (1024 ** 3), 2)) + " GB\nAvailable memory: " + str(
        round(mem_stats.available / (1024 ** 3), 2)) + " GB"
    return mem_utilization, details


hostName = get_details()
memory_percentage, memory_details = display_memory_usage(hostName)
disk_percentage, disk_details = display_disk_usage(hostName)
load1, load5, load15 = psutil.getloadavg()

""""
    Check whether the load average usage is greater than the threshold
"""
if load5 >= LOAD_AVERAGE_THRESHOLD:
    print("\nMaximum load average usage threshold: " + str(LOAD_AVERAGE_THRESHOLD) + " reached")
    print_with_timestamp("Used load average: " + str(load5))
    send_email("LOAD ALERT: " + SERVER_NAME, str(load5))
    get_details()

''''
    Check whether the memory usage is greater than the threshold
'''
if memory_percentage >= MEMORY_THRESHOLD_PERCENTAGE:
    print("\nMaximum memory usage threshold: " + str(MEMORY_THRESHOLD_PERCENTAGE) + "% reached")
    print_with_timestamp("Used memory percentage: " + memory_details)
    if memory_percentage < PERCENTAGE_90:
        send_email("MEMORY ALERT: " + SERVER_NAME, memory_details)
        get_details()
    else:
        send_email("MEMORY IS FULL: " + SERVER_NAME, memory_details)
        get_details()

''''
    Check whether the disk usage is greater than the threshold
'''
if disk_percentage >= DISK_THRESHOLD_PERCENTAGE:
    print("\nMaximum disk usage threshold: " + str(DISK_THRESHOLD_PERCENTAGE) + "% reached")
    print_with_timestamp("Used disk percentage: " + disk_details)
    if disk_percentage < PERCENTAGE_90:
        send_email("DISK ALERT: " + SERVER_NAME, disk_details)
        get_details()
    else:
        send_email("DISK IS FULL: " + SERVER_NAME, disk_details)
        get_details()
