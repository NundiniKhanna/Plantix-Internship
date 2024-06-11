These were the RnD tasks that I completed in 1st week of internhship at Plantix.

Task 1: Set up an alert for AWS instance capacity reaching 60%.
Steps to Achieve Task 1:

    Monitoring Setup:
        Utilize AWS CloudWatch to monitor the instance's CPU utilization.
        Create a CloudWatch alarm to trigger when CPU utilization reaches 60%.

    Notification Setup:
        Choose the preferred notification mechanism: Email or Mattermost.
        Configure the notification service to receive alerts from CloudWatch.

Task 2: Implement auto-rotation for RDS credentials.
Steps to Achieve Task 2:

    RDS Credential Rotation:
        Utilize AWS IAM Database Authentication or RDS Rotation for MySQL.
        Configure automatic rotation every 3 months.

    Notification of New Credentials:
        Implement a mechanism to share new credentials via email.
        Utilize AWS SES (Simple Email Service) or an SMTP server to send emails.

    Credential Storage Update:
        Choose between AWS Systems Manager (SSM) Parameter Store or AWS Secrets Manager to store credentials.
        Update the stored credentials after rotation.

Considerations:

    Permissions: Ensure IAM roles have appropriate permissions for these tasks.
    Monitoring: Regularly monitor the functioning of alerts and rotation processes.
    Security: Keep security best practices in mind throughout implementation.

Tools and Services:

    AWS CloudWatch, SES, IAM, RDS
    Mattermost or Email service for notifications
    AWS SSM Parameter Store or Secrets Manager for credential storage
