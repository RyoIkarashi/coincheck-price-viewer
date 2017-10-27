#!/usr/bin/env /usr/local/bin/node

const bitbar = require('bitbar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const data = utils.requireJSON('./coincheck.json');
const COINS = require('./coins');
const ENV = utils.requireJSON('./env.json');
const API_BASE = 'https://coincheck.com/api'
const API_RATE_URI = `${API_BASE}/rate`;
const API_BALANCE_URI = `${API_BASE}/accounts/balance`;
const COMPARATIVE_UNIT = 'jpy';
const getLatestRate = (coin_unit) => axios.get(`${API_RATE_URI}/${coin_unit}_${COMPARATIVE_UNIT}`);
const getAllCoinsRate = Object.entries(COINS).map(coin => ({ [coin[0]]: getLatestRate(coin[1].unit).then(result => result.data.rate) }) );
const allPromises = getAllCoinsRate.map((item, index) => Object.keys(item).map(second => getAllCoinsRate[index][second])[0]);

const getBalance = () => {
  return axios.get(API_BALANCE_URI, {headers: utils.setSignature(API_BALANCE_URI)});
}

axios.all([...allPromises, getBalance()]).then((result) => {
  let newData = {};
  const balance = result[result.length - 1].data;
  let total = Number(balance.jpy);

  const bitbarContent = getAllCoinsRate.map((coin, index) => {
    const entries = Object.entries(COINS);
    const image = entries[index][1].image;
    const unit  = entries[index][1].unit;
    const name  = entries[index][0];
    const rate = result[index];
    const difference = data[name] - rate;
    const prefix = difference >= 0 ? '-' : '+';

    total += balance[unit] * rate;

    newData[name] = rate;

    return {
      text: `${rate} (${prefix}${Math.abs(utils.floatFormat(difference, 3))}) [${unit.toUpperCase()}]`,
      templateImage: image,
      color: prefix === '-' ? ENV.colors.red : ENV.colors.green,
      href: `https://coincheck.com/ja/exchange/charts/coincheck/${unit}_jpy/300`
    }
  });

  fs.writeFile(path.resolve(__dirname, 'coincheck.json'), JSON.stringify(newData), () => {});

  const totalBalance = {
    text: `¥${utils.floatFormat(total, 3)}`,
  };

  bitbar([
    totalBalance,
    bitbar.sep,
    ...bitbarContent,
  ]);
});
