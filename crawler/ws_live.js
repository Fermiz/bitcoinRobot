const moment = require('moment');
const WebSocket = require('ws');
const pako = require('pako');

const WS_URL = 'wss://api.huobi.pro/ws';

var symbols = ['xrpbtc'];

// let list_btc = ['ltc-btc', 'eth-btc', 'etc-btc', 'bcc-btc', 'dash-btc', 'omg-btc', 'eos-btc', 'xrp-btc', 'zec-btc', 'qtum-btc'];
// let list_usdt = ['btc-usdt', 'ltc-usdt', 'eth-usdt', 'etc-usdt', 'bcc-usdt', 'dash-usdt', 'xrp-usdt', 'eos-usdt', 'omg-usdt', 'zec-usdt', 'qtum-usdt'];


var period = ['1min', '5min', '15min', '30min', '60min', '1day', '1mon', 'week', '1year']

var orderbook = {};

exports.OrderBook = orderbook;

function handle(data) {
    // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
    let symbol = data.ch.split('.')[1];
    orderbook[symbol] = data.tick;
}

function init() {
    var ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('open');
        for (let symbol of symbols) {
            ws.send(JSON.stringify({
                "sub": `market.${symbol}.kline.${period[0]}`,
                "id": `${symbol}`
            }));
        }
    });
    ws.on('message', (data) => {
        let text = pako.inflate(data, {
            to: 'string'
        });
        let msg = JSON.parse(text);
        if (msg.ping) {
            ws.send(JSON.stringify({
                pong: msg.ping
            }));
        } else if (msg.tick) {
            handle(msg);
        } else {
            console.log(text);
        }
    });
    ws.on('close', () => {
        console.log('close');
        init();
    });
    ws.on('error', err => {
        console.log('error', err);
        init();
    });
}

init();