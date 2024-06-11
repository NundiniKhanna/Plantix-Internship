# Plantix-Internship
Internship work at Plantix

# Project Overview

This README provides a comprehensive guide to setting up alerts and implementing auto-rotation for RDS credentials using various AWS services. The following sections cover how to set up alerts for instance capacity, automate credential rotation for RDS, and understand the functionalities of AWS RDS, AWS Secret Manager, and AWS SNS.

## Table of Contents

1. [Setting Up Alerts](#setting-up-alerts)
2. [Implementing Auto-Rotation for RDS Credentials](#implementing-auto-rotation-for-rds-credentials)
    - [Rotate Credentials](#rotate-credentials)
    - [Share New Credentials](#share-new-credentials)
    - [Update Credentials](#update-credentials)
3. [AWS RDS](#aws-rds)
4. [AWS Secret Manager](#aws-secret-manager)
5. [AWS SNS](#aws-sns)

## Setting Up Alerts

To ensure timely notifications when AWS instance capacity reaches 60%, follow these steps to set up alerts via email or Mattermost:

1. **Create an SNS Topic:**
   - ARN: `arn:aws:sns:ap-south-1:815469512242:Task1_topic`
   
2. **Subscribe to the SNS Topic:**
   - Email: Subscribe with your email address.
   - Mattermost: Configure Mattermost to receive alerts using the endpoint `aws-alerts`.
   
3. **Configure CloudWatch Alarms:**
   - Set up a CloudWatch alarm to monitor instance capacity.
   - Trigger the alarm when the capacity reaches 60%.
   - Set the alarm action to notify the SNS topic.

## Implementing Auto-Rotation for RDS Credentials

### Rotate Credentials

To implement auto-rotation for RDS credentials every 3 months:

1. **Use AWS Secrets Manager:**
   - Enable automatic rotation for your RDS credentials.
   - Set the rotation interval to 90 days.

### Share New Credentials

To share the new credentials with a specified list of email addresses:

1. **Set Up Notifications:**
   - Configure the rotation Lambda function to send the new credentials to the specified email addresses using Amazon SES or another email service.

### Update Credentials

To update the credentials in AWS Systems Manager (SSM) or AWS Secrets Manager:

1. **Update in SSM or Secrets Manager:**
   - Ensure that the rotation Lambda function updates the credentials in either SSM Parameter Store or AWS Secrets Manager.

## AWS RDS

AWS RDS allows you to set up, operate, and scale a relational database in the cloud. When dealing with multiple instances within a database cluster:

1. **Primary Instance:**
   - The primary instance handles all the write operations and is the main point of interaction.
   
2. **Read Replicas:**
   - Multiple read replicas can be configured to handle read-only operations, reducing the load on the primary instance.

3. **Failover:**
   - In case of an issue with the primary instance, the failover mechanism promotes one of the read replicas to primary, ensuring high availability and reliability.

## AWS Secret Manager

AWS Secrets Manager helps you manage and automate the rotation of secrets such as database credentials, API keys, and other secrets:

1. **Auto-Rotation of Credentials:**
   - You can enable automatic rotation for secrets, specifying a Lambda function to handle the rotation.
   - Secrets Manager calls the Lambda function to rotate the secret as per the defined schedule (e.g., every 3 months).

## AWS SNS

AWS Simple Notification Service (SNS) allows you to send messages to subscribing endpoints and clients:

1. **Topic & Subscription:**
   - **Topic:** A logical access point that acts as a communication channel.
   - **Subscription:** Endpoint that receives messages published to a topic. Subscribers can be email addresses, HTTP endpoints, Lambda functions, etc.
   
2. **FCM Integration:**
   - SNS supports sending notifications to mobile devices through Firebase Cloud Messaging (FCM), enabling push notifications to Android devices.

By following the steps and guidelines provided in this README, you can effectively manage instance capacity alerts, automate RDS credential rotation, and leverage the functionalities of AWS RDS, Secret Manager, and SNS.










