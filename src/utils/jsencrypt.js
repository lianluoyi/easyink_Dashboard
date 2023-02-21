import forge from 'node-forge';
// base64转换
const encode64 = str => forge.util.encode64(str);

// rsa加密
const RSAECBEncrypt = (msg, publicKey) => {
  const pki = forge.pki;
  const publicKeyObj = pki.publicKeyFromPem(`-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`);
  const buffer = forge.util.createBuffer(msg, 'utf8');
  const bytes = buffer.getBytes();
  const encrypted = publicKeyObj.encrypt(bytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create()
    }
  });
  return encode64(encrypted);
};

export {
  RSAECBEncrypt
};
