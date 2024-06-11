import boto3
import json
import os

def lambda_handler(event, context):
    secret_name = event['SecretId']
    secret_value = get_secret_value(secret_name)
    
    # Retrieve environment variables
    email_list_string = os.environ['EMAIL_LIST']
    email_list = [email.strip('"') for email in email_list_string.split(',')]
    
    ses_source_email = os.environ['SES_SOURCE_EMAIL'].strip('"')

    # Logic to send email using SES
    ses_client = boto3.client('ses')
    subject = "New RDS Credentials"
    body = f"New credentials for RDS instance: {json.dumps(secret_value)}"
    
    for email in email_list:
        response = ses_client.send_email(
            Source=ses_source_email,
            Destination={
                'ToAddresses': [email]
            },
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body}}
            }
        )

def get_secret_value(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])
