const AWS = require('aws-sdk');

let myLocalSecrets = null;

const initialiseSecrets = async (region, wallet) => {
  const secrets = new AWS.SecretsManager({
    region
  });

  try {
    if (!wallet) throw new Error('wallet must be defined');

    const mySecretsValue = await secrets.getSecretValue({SecretId: wallet}).promise();
    if (typeof mySecretsValue.SecretString !== 'undefined') {
      const mySecrets = JSON.parse(mySecretsValue.SecretString);

      if (typeof mySecrets == 'undefined') {
        throw new Error(`Unexpected parsing of secrets wallet: ${wallet}`);
      }

      myLocalSecrets = {
        CQC_DB_USER: mySecrets.CQC_DB_USER,
        CQC_DB_PASS: mySecrets.CQC_DB_PASS,
        CQC_DB_HOST: mySecrets.CQC_DB_HOST,
        CQC_DB_CLIENT_SSL_CERTIFICATE: mySecrets.CQC_DB_CLIENT_SSL_CERTIFICATE,
        CQC_DB_CLIENT_SSL_KEY: mySecrets.CQC_DB_CLIENT_SSL_KEY,
        CQC_DB_CLIENT_SSL_CA: mySecrets.CQC_DB_CLIENT_SSL_C
      };
    }

  } catch (err) {
    console.error('Failed to load AWS secrets: ', err);
  }
};

const resetSecrets = () => {
  myLocalSecrets = null;
};

const dbHost = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_HOST) {
      throw new Error('Unknown CQC_DB_HOST secret');
    } else {
      return myLocalSecrets.CQC_DB_HOST;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const dbPass = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_PASS) {
      throw new Error('Unknown CQC_DB_PASS secret');
    } else {
      return myLocalSecrets.CQC_DB_PASS;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const dbUser = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_USER) {
      throw new Error('Unknown CQC_DB_USER secret');
    } else {
      return myLocalSecrets.CQC_DB_USER;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const dbAppUserKey = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_CLIENT_SSL_KEY) {
      throw new Error('Unknown DB_APP_USER_KEY secret');
    } else {
      return myLocalSecrets.CQC_DB_CLIENT_SSL_KEY;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};
const dbAppUserCertificate = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_CLIENT_SSL_CA) {
      throw new Error('Unknown DB_APP_USER_CERT secret');
    } else {
      return myLocalSecrets.CQC_DB_CLIENT_SSL_CA;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};
const dbAppRootCertificate = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.CQC_DB_CLIENT_SSL_CERTIFICATE) {
      throw new Error('Unknown DB_ROOT_CRT secret');
    } else {
      return myLocalSecrets.CQC_DB_CLIENT_SSL_CERTIFICATE;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};


module.exports = {
  initialiseSecrets,
  dbHost,
  dbPass,
  dbUser,
  dbAppUserKey,
  dbAppUserCertificate,
  dbAppRootCertificate
};
