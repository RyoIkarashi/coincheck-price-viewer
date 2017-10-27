const crypto = require('crypto');
const ENV = require('./env.json');

exports.requireJSON = (path) => {
  let json;
  try {
    json = require(path);
  } catch(err) {
    json = JSON.stringify({});
  }
  return json;
}

exports.floatFormat = (number, n) => {
  const _pow = Math.pow(10 , n) ;
  return Math.round(number * _pow) / _pow;
}

exports.setSignature = (url, obj = {}) => {
  const nonce = new Date().getTime();
  const message = nonce + url + ((Object.keys(obj).length > 0) ? JSON.stringify(obj) : '');
  const signature = crypto.createHmac('sha256', ENV.secret_key).update(message).digest('hex');
  const headers = {
    'ACCESS-KEY': ENV.access_key,
    'ACCESS-NONCE': nonce,
    'ACCESS-SIGNATURE': signature
  };
  return headers;
};
