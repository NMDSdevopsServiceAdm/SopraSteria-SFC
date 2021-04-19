const Sentry = require('@sentry/node');
const openpgp = require('openpgp');
var config = require('../../../../server/config/config');
const textEncoding = require('text-encoding-utf-8');

global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;

const decrypt = async (encryptedMessage) => {
  if (!encryptedMessage) {
    return null;
  }

  try {

    const privateKeyArmored =  Buffer.from(config.get('encryption.privateKey'), 'base64').toString('utf-8')
    const passphrase = config.get('encryption.passphrase');

    const privateKey = await openpgp.readKey({ armoredKey: privateKeyArmored });
    await privateKey.decrypt(passphrase);
    const message = await openpgp.readMessage({
      armoredMessage: encryptedMessage,
    });

    const decryptedMessage = await openpgp.decrypt({
      message,
      privateKeys: privateKey,
    });

    return await openpgp.stream.readToEnd(decryptedMessage.data);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw new Error('Unable to retrieve');
  }
};

module.exports.decrypt = decrypt;
