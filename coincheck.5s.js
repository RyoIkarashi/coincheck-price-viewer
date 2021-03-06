#!/usr/bin/env /usr/local/bin/node

// <bitbar.title>Coincheck Price Viewer</bitbar.title>
// <bitbar.version>v1.0</bitbar.version>
// <bitbar.author>Ryo Ikarashi</bitbar.author>
// <bitbar.author.github>RyoIkarashi</bitbar.author.github>
// <bitbar.desc>Display the spot JPY prices of cryptocurrencies and your current balance in coincheck.com</bitbar.desc>
// <bitbar.image>https://user-images.githubusercontent.com/5750408/32211052-25739bd4-be54-11e7-8d99-e65b1fc00d41.png</bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.abouturl>https://github.com/RyoIkarashi/coincheck-price-viewer</bitbar.abouturl>

// If you feel this little tool gives you some value, tips are always welcome at the following addresses!
// Bitcoin: 1DrLPjzmNHtkdBstd82xvCxGY38PnKauRH
// Mona:    MC7XMmi1YXoJH19D1q4H8ijBkdvarWBTMi

const bitbar = require('bitbar');
const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const utils = require('./utils');
const data = utils.requireJSON('./coincheck.json');
const COINS = require('./coins');
const ENV = utils.requireJSON('./env.json');
const API_HOST = 'https://coincheck.com';
const API_BASE = '/api'
const API_RATE_URI = `${API_HOST}${API_BASE}/rate`;
const API_BALANCE_URI = `${API_HOST}${API_BASE}/accounts/balance`;
const EXCNAHGE_URI = `${API_HOST}/exchange`
const COMPARATIVE_UNIT = 'jpy';

const getLatestRate = (coin_unit) => axios.get(`${API_RATE_URI}/${coin_unit}_${COMPARATIVE_UNIT}`);

const getAllCoinsRate = Object.entries(COINS).map(coin => ({ [coin[0]]: getLatestRate(coin[1].unit).then(result => result.data.rate) }) );

const allPromises = getAllCoinsRate.map((item, index) => Object.keys(item).map(second => getAllCoinsRate[index][second])[0]);

const getBalance = () => axios.get(API_BALANCE_URI, {headers: utils.setSignature(API_BALANCE_URI)})

const getHTML = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://coincheck.com/exchange');

  const content = await page.content();
  const $ = cheerio.load(content);
  await browser.close();
  return $;
}

const fixPrefix = (volatility) => ~volatility.indexOf('-') ? volatility.replace('+', '') : volatility;

const getVolatility = ($) => {
  const $coins = $('.currency_list td');
  let volatilities = {};
  $coins.each((i, element) => {
    const name = $(element).find('.currency_name').text().toLowerCase().replace(' ', '_');
    volatilities[name] = fixPrefix($(element).find('.currency_desc.up').text());
  });
  return volatilities;
}

axios.all([...allPromises, getBalance(), getHTML()]).then((result) => {
  const balance = result[result.length - 2].data;
  const $ = result[result.length - 1];
  const volatilities = getVolatility($);
  let total = Number(balance.jpy);

  const bitbarContent = getAllCoinsRate.map((coin, index) => {
    const entries = Object.entries(COINS);
    const image = entries[index][1].image;
    const unit  = entries[index][1].unit;
    const name  = entries[index][0];
    const rate = result[index];
    const volatility = volatilities[name];

    total += balance[unit] * rate;

    return {
      text: `${rate} (${volatility}) [${unit.toUpperCase()}]`,
      templateImage: image,
      color: volatility.substr(0,1) === '-' ? ENV.colors.red : ENV.colors.green,
      href: `https://coincheck.com/ja/exchange/charts/coincheck/${unit}_jpy/300`
    };
  });

  const totalBalance = { text: `¥${utils.floatFormat(total, 3)}` };

  bitbar([
    totalBalance,
    bitbar.sep,
    ...bitbarContent,
  ]);
});
