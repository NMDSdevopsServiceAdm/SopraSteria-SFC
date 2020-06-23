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
        SLACK_URL: mySecrets.SLACK_URL,
        DB_HOST: mySecrets.DB_HOST,
        DB_PASS: mySecrets.DB_PASS,
        Token_Secret: mySecrets.Token_Secret,
        NOTIFY_KEY: mySecrets.NOTIFY_KEY,
        DB_ROOT_CRT: mySecrets.DB_ROOT_CRT,
        DB_APP_USER_KEY: mySecrets.DB_APP_USER_KEY,
        DB_APP_USER_CERT: mySecrets.DB_APP_USER_CERT,
        ADMIN_URL: mySecrets.ADMIN_URL,
        DD_API_KEY: mySecrets.DD_API_KEY,
        SENTRY_DSN: mySecrets.SENTRY_DSN,
        HONEYCOMB_WRITE_KEY: mySecrets.HONEYCOMB_WRITE_KEY
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
    if (!myLocalSecrets.DB_HOST) {
      throw new Error('Unknown DB_HOST secret');
    } else {
      return myLocalSecrets.DB_HOST;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

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
}

const jwtSecret = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.Token_Secret) {
      throw new Error('Unknown Token_Secret secret');
    } else {
      return myLocalSecrets.Token_Secret;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const slackUrl = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.SLACK_URL) {
      throw new Error('Unknown SLACK_URL secret');
    } else {
      return myLocalSecrets.SLACK_URL;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const  govNotify = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.NOTIFY_KEY) {
      throw new Error('Unknown NOTIFY_KEY secret');
    } else {
      return myLocalSecrets.NOTIFY_KEY;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const  adminUrl = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.ADMIN_URL) {
      throw new Error('Unknown ADMIN_URL secret');
    } else {
      return myLocalSecrets.ADMIN_URL;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const datadogApiKey = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DD_API_KEY) {
      return '';
    } else {
      return myLocalSecrets.DD_API_KEY;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const sentryDsn = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.SENTRY_DSN) {
      return '';
    } else {
      return myLocalSecrets.SENTRY_DSN;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const honeycombWriteKey = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.HONEYCOMB_WRITE_KEY) {
      return '';
    } else {
      return myLocalSecrets.HONEYCOMB_WRITE_KEY;
    }
  } else {
    throw new Error('Unknown secrets');
  }
}

const dbAppUserKey = () => {
  if (myLocalSecrets !== null) {
    if (!myLocalSecrets.DB_APP_USER_KEY) {
      throw new Error('Unknown DB_APP_USER_KEY secret');
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
      throw new Error('Unknown DB_APP_USER_CERT secret');
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
      throw new Error('Unknown DB_ROOT_CRT secret');
    } else {
      return myLocalSecrets.DB_ROOT_CRT;
    }
  } else {
    throw new Error('Unknown secrets');
  }
};


module.exports.initialiseSecrets = initialiseSecrets;
module.exports.dbHost = dbHost;
module.exports.dbPass = dbPass;
module.exports.jwtSecret = jwtSecret;
module.exports.slackUrl = slackUrl;
module.exports.govNotify = govNotify;
module.exports.dbAppUserKey = dbAppUserKey;
module.exports.dbAppUserCertificate = dbAppUserCertificate;
module.exports.dbAppRootCertificate = dbAppRootCertificate;
module.exports.adminUrl = adminUrl;
module.exports.datadogApiKey = datadogApiKey;
module.exports.sentryDsn = sentryDsn;
module.exports.honeycombWriteKey = honeycombWriteKey;
