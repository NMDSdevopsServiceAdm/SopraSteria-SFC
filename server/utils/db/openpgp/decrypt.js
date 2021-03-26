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
    const privateKeyArmored = config.get('encryption.privateKey');
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

    const decryptedData = await openpgp.stream.readToEnd(decryptedMessage.data);
    return decryptedData;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports.decrypt = decrypt;
