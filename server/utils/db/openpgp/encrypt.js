const Sentry = require('@sentry/node');
const openpgp = require('openpgp');
var config = require('../../../../server/config/config');
const textEncoding = require('text-encoding-utf-8');

global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;

const encrypt = async (message) => {
  if (!message) {
    return null;
  }

  try {
    const publicKeyArmored =  Buffer.from(config.get('encryption.publicKey'), 'base64').toString('utf-8')
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const encryptedData = await openpgp.encrypt({
      message: openpgp.Message.fromText(message), // input as Message object
      publicKeys: publicKey, // for encryption
    });

    return encryptedData;
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw new Error('Unable to save');
  }
};

module.exports.encrypt = encrypt;
