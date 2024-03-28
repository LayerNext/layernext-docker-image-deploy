import os
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from dotenv import load_dotenv

load_dotenv(dotenv_path="/home/ubuntu/layernext-docker-image-deploy/source/manual/.env")

sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
from_email = os.getenv("FROM_EMAIL")


def send_email(to_emails, subject, content):
    sg = sendgrid.SendGridAPIClient(api_key=sendgrid_api_key)
    _from_email = Email(from_email)  # Change to your verified sender
    to_email = To(to_emails)  # Change to your recipient
    content = Content("text/plain", content)
    mail = Mail(_from_email, to_email, subject, content)

    try:
        response = sg.client.mail.send.post(request_body=mail.get())
        print(f"Email sent! Status code: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {e}")


def send_email_via_sendgrid(to_emails, subject, content):
    for email in to_emails:
        send_email(email, subject, content)


# to_emails = ['chathushkahome9@gmail.com', 'chathushka@zoomi.ca']  # Recipient email address
# subject = 'Hello from SendGrid'
# content = 'Sending this email with SendGrid is easy!'

# send_email_via_sendgrid(to_emails, subject, content)
