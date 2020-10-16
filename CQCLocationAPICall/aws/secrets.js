const AWS = require('aws-sdk');

let myLocalSecrets = null;

const initialiseSecrets = async (region, wallet) => {
  const secrets = new AWS.SecretsManager({
    region,
  });
  console.log('Initialising AWS Secret');
  try {
    if (!wallet) throw new Error('wallet must be defined');
    const mySecretsValue = await secrets
      .getSecretValue({ SecretId: wallet })
      .promise()
      .then((mySecretsValue) => {
        console.log('Got secrets from AWS');
        return mySecretsValue;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    console.log('Checking Secret');
    if (typeof mySecretsValue.SecretString !== 'undefined') {
      console.log('Got Secrets');
      const mySecrets = JSON.parse(mySecretsValue.SecretString);

      if (typeof mySecrets == 'undefined') {
        throw new Error(`Unexpected parsing of secrets wallet: ${wallet}`);
      }

      myLocalSecrets = {
        DB_USER: mySecrets.DB_USER,
        DB_PASS: mySecrets.DB_PASS,
        DB_NAME: mySecrets.DB_NAME,
        DB_HOST: mySecrets.DB_HOST,
        DB_ROOT_CRT: mySecrets.DB_ROOT_CRT,
        DB_APP_USER_KEY: mySecrets.DB_APP_USER_KEY,
        DB_APP_USER_CERT: mySecrets.DB_APP_USER_CERT,
      };
    }
  } catch (err) {
    console.error('Failed to load AWS secrets: ', err);
  }
};

const dbHost = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_HOST) {
      throw new Error('Unknown DB_HOST secret');
    } else {
      return myLocalSecrets.DB_HOST;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};

const dbName = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_NAME) {
      throw new Error('Unknown DB_NAME secret');
    } else {
      return myLocalSecrets.DB_NAME;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};

const dbPass = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_PASS) {
      throw new Error('Unknown DB_PASS secret');
    } else {
      return myLocalSecrets.DB_PASS;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};

const dbUser = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_USER) {
      throw new Error('Unknown DB_USER secret');
    } else {
      return myLocalSecrets.DB_USER;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};

const dbAppUserKey = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_APP_USER_KEY) {
      return '';
    } else {
      return myLocalSecrets.DB_APP_USER_KEY;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};
const dbAppUserCertificate = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_APP_USER_CERT) {
      return '';
    } else {
      return myLocalSecrets.DB_APP_USER_CERT;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};
const dbAppRootCertificate = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_ROOT_CRT) {
      return '';
    } else {
      return myLocalSecrets.DB_ROOT_CRT;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};

module.exports = {
  initialiseSecrets,
  dbHost,
  dbName,
  dbPass,
  dbUser,
  dbAppUserKey,
  dbAppUserCertificate,
  dbAppRootCertificate,
};
