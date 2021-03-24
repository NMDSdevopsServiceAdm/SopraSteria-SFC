const openpgp = require('openpgp');
var config = require('../../../../server/config/config');
const textEncoding = require('text-encoding-utf-8');

global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;
​
const encrypt = async (message) => {
  const publicKeyArmored = config.get('encryption.publicKey');
//   const privateKeyArmored =  config.get('encryption.privateKey');
//   const passphrase =  config.get('encryption.passphrase');
// ​
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  // const privateKey = await openpgp.readKey({ armoredKey: privateKeyArmored });
  // await privateKey.decrypt(passphrase);
​
    const encryptedData = await openpgp.encrypt({
      message: openpgp.Message.fromText(message), // input as Message object
      publicKeys: publicKey, // for encryption
    });
  return encryptedData;
};

// (async () => {
//     const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
//         type: 'rsa', // Type of the key
//         rsaBits: 4096, // RSA key size (defaults to 4096 bits)
//         userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
//         passphrase: 'super long and hard to guess secret' // protects the private key
//     });
​
//     console.log(privateKeyArmored);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
//     console.log(publicKeyArmored);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
//     console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
// })();
