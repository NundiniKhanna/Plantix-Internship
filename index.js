const { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { RDSClient, ModifyDBInstanceCommand, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { SSMClient, PutParameterCommand } = require("@aws-sdk/client-ssm");
const https = require('https');

const secretsManagerClient = new SecretsManagerClient();
const rdsClient = new RDSClient();
const sesClient = new SESClient();
const ssmClient = new SSMClient();

exports.handler = async (event) => {
    try {
        // Step 1: Generate new credentials and update RDS instance with new password
        const secretName = 'AppBeta';
        const secretValue = await getSecretValue(secretName);

        const newPassword = generatePassword();
        const newSecretValue = { ...secretValue, password: newPassword };

        await updateRDSInstance(newSecretValue);

        // Step 2: Store the new credentials in Secrets Manager
        await storeNewSecret(secretName, newSecretValue);

        // Step 3: Send an email using SES of the updated credentials
        const emailListString = process.env.EMAIL_LIST;
        const emailList = emailListString.split(',').map(email => email.trim().replace(/"/g, ''));
        const sesSourceEmail = process.env.SES_SOURCE_EMAIL.trim().replace(/"/g, '');

        const subject = "New RDS Credentials";
        const body = `New credentials for RDS instance: ${JSON.stringify(newSecretValue)}`;

        for (const email of emailList) {
            await sendEmail(sesSourceEmail, email, subject, body);
        }

        // Step 4: Store each secret field in Systems Manager Parameter Store
        const parameterNames = {
            username: '/project/aws-node/db_username',
            password: '/project/aws-node/db_password',
            engine: '/project/aws-node/db_engine',
            host: '/project/aws-node/db_host',
            port: '/project/aws-node/db_port',
            dbInstanceIdentifier: '/project/aws-node/db_dbInstanceIdentifier'
        };

        for (const [key, parameterName] of Object.entries(parameterNames)) {
            if (newSecretValue[key]) {
                const value = String(newSecretValue[key]);
                console.log(`Storing ${parameterName} with value: ${value}`);
                await ssmClient.send(new PutParameterCommand({
                    Name: parameterName,
                    Value: value,
                    Type: 'SecureString',
                    Overwrite: true
                }));
            }
        }

        // Trigger GitHub Actions workflow
        await triggerGitHubWorkflow();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Operation completed successfully' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};

const getSecretValue = async (secretName) => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsManagerClient.send(command);
    return JSON.parse(response.SecretString);
};

const generatePassword = (length = 16) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%^&*()_+';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

const updateRDSInstance = async (newSecretValue, retries = 3) => {
    const { dbInstanceIdentifier, username, password } = newSecretValue;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const dbInstanceStatus = await getRDSInstanceStatus(dbInstanceIdentifier);
            if (dbInstanceStatus !== 'available') {
                throw new Error(`DBInstance ${dbInstanceIdentifier} is not in available state. Current state: ${dbInstanceStatus}`);
            }

            const command = new ModifyDBInstanceCommand({
                DBInstanceIdentifier: dbInstanceIdentifier,
                MasterUserPassword: password
            });
            await rdsClient.send(command);
            return;
        } catch (error) {
            if (attempt < retries - 1) {
                console.log(`Retrying updateRDSInstance (${attempt + 1}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                throw error;
            }
        }
    }
};

const getRDSInstanceStatus = async (dbInstanceIdentifier) => {
    const command = new DescribeDBInstancesCommand({ DBInstanceIdentifier: dbInstanceIdentifier });
    const response = await rdsClient.send(command);
    return response.DBInstances[0].DBInstanceStatus;
};

const storeNewSecret = async (secretName, newSecretValue) => {
    const command = new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: JSON.stringify(newSecretValue)
    });
    await secretsManagerClient.send(command);
};

const sendEmail = async (sourceEmail, destinationEmail, subject, body) => {
    const command = new SendEmailCommand({
        Source: sourceEmail,
        Destination: { ToAddresses: [destinationEmail] },
        Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: body } }
        }
    });
    await sesClient.send(command);
};

const triggerGitHubWorkflow = async () => {
    const data = JSON.stringify({
        
        event_type: "trigger-ci-cd"
    });

    const options = {
        hostname: 'api.github.com',
       path: `/repos/<owner>/<repo>/actions/workflows/deploy.yml/dispatches`,
        method: 'POST',
        headers: {
            'Authorization': 'token github_pat_11AXGRJJA0ejZIhX7LTkM7_vAe2Jy24JDmDHCk5dMG782bmNGkMBBsf2j5vDHQmjiDBIFQI5Q7zmg8zh',
            'User-Agent': 'node.js',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve(responseData);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
};
