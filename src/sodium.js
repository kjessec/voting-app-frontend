const crypto = require('crypto'),
  bs58check = require('bs58check'),
  sodium = require('libsodium-wrappers'),
  prompt = require('prompt');
const prefix = {
  edesk: new Uint8Array([7, 90, 60, 179, 41]),
  edpk: new Uint8Array([13, 15, 37, 217]),
  edsk: new Uint8Array([43, 246, 78, 7]),
  edsk2: new Uint8Array([13, 15, 58, 7]),
  tz1: new Uint8Array([6, 161, 159])
};
const b58cencode = (payload, prefix) => {
  const n = new Uint8Array(prefix.length + payload.length);
  n.set(prefix);
  n.set(payload, prefix.length);
  return bs58check.encode(Buffer.from(n, 'hex'));
};
const b58cdecode = (encrypted, prefix) => bs58check.decode(encrypted).slice(prefix.length);
const generateKeys = kp => ({
  sk: b58cencode(kp.privateKey, prefix.edsk),
  pk: b58cencode(kp.publicKey, prefix.edpk),
  pkh: b58cencode(sodium.crypto_generichash(20, kp.publicKey), prefix.tz1)
});
const extractKeys = sk => {
  console.log(sk)
  if (sk.length == 98) {
    const kp = {
      privateKey: sk,
      publicKey: b58cdecode(sk, prefix.edsk).slice(32)
    };
    const keys = generateKeys(kp);
    keys.sk = sk;
    return keys;
  } else { // sk.length == 54
    const s = b58cdecode(sk, prefix.edsk2);
    const kp = sodium.crypto_sign_seed_keypair(s);
    return generateKeys(kp);
  }
}
const extractEncryptedKeys = (esk, password) => {
  const esb = b58cdecode(esk, prefix.edesk);
  const salt = esb.slice(0, 8);
  const esm = esb.slice(8);
  const derivedKey = crypto.pbkdf2Sync(password, salt, 32768, 32, 'sha512');
  const kp = sodium.crypto_sign_seed_keypair(sodium.crypto_secretbox_open_easy(esm, new Uint8Array(24), new Uint8Array(derivedKey)));
  return generateKeys(kp);
}

const scheme = {
  properties: {
    secret_key: {
      pattern: /ede?sk.+/,
      message: "Only edsk or edesk (edd25519) are supported",
      required: true
    },
    password: {
      hidden: true,
      replace: '*',
      required: true,
      message: "Please enter your password",
      ask: () => prompt.history('secret_key').value.substr(0, 5) == 'edesk'
    }
  }
};
