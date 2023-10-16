import pkg from 'telegraf';
import * as dotenv from 'dotenv';
import * as http from 'http';
import { CronJob } from 'cron';
import { getRndInteger } from './utils.js';
import { texts } from './texts.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
moment.tz.setDefault("Asia/Seoul");
const {Telegraf, Markup} = pkg;
dotenv.config();
moment.tz.setDefault("Asia/Seoul");

console.log();
let orders = [];

const addOrder = () => {
    for (let i = 0; i < getRndInteger(1, 3); i++) {
        orders.push({
            date: moment().format('YYYY/MM/DD'),
            code: uuidv4().slice(0, 8).toUpperCase(),
            amount: getRndInteger(50, 300),
        });
    }

}

for(let i=0; i < getRndInteger(1,5); i++ ) {
    for (i = 0; i< 7; i++) {
        addOrder();
    }
}
new CronJob(
    '0 0 0 * * *',
    function () {
        let orders = [];
        addOrder();
    },
    null,
    true,
    'UTC+9:00'
);

new CronJob(
    '0 0 * * * *',
    function () {
        addOrder();
    },
    null,
    true,
    'UTC+9:00'
);

const mainMenu = (lang) =>[[ texts.lng_settings[lang], texts.admin_info[lang], texts.order_status[lang],]]

const langKeyBoard = {
    reply_markup: {
        inline_keyboard: [
            [{text: "ENGLISH 🇬🇧", callback_data: "eng"}, {text: "KOREAN 🇰🇷", callback_data: "ko"}],
        ]
    }
};

const getOrders = (lang) => orders.map((order) => {
    return `${order.date} ${order.code} ${order.amount} $ \n`
}).join('');



const getAdminInfo = (lang) => {
    return texts.admin_info_in[lang];
}

const bot = new Telegraf(process.env.TOKEN);
bot.start((ctx) => {
    return ctx.replyWithVideo('https://blog.sagipl.com/wp-content/uploads/2022/02/feature-of-p2p.gif', {
        reply_markup: Markup.keyboard(mainMenu('en')),
        reply_html: true,
        caption: `Welcome to P2P Exchange Bot`
    })
});


bot.hears(texts.lng_settings['en'], (ctx) => ctx.reply(`Choose Language`, langKeyBoard));
bot.hears(texts.lng_settings['ko'], (ctx) => ctx.reply(`Choose Language`, langKeyBoard));

bot.hears(texts.order_status['en'], (ctx) => ctx.replyWithHTML(getOrders('en')));
bot.hears(texts.order_status['ko'], (ctx) => ctx.replyWithHTML(getOrders('en')));
bot.hears(texts.admin_info['en'], (ctx) => {
    return ctx.reply(`${texts.admin_info_in['en']}`)
});
bot.hears(texts.admin_info['ko'], (ctx) => {
    return ctx.reply(`${texts.admin_info_in['ko']}`)
});
bot.action('eng', (ctx) => {
    return ctx.reply(`Language was changed`, {reply_markup: Markup.keyboard(mainMenu('en'))})
});
bot.action('ko', (ctx) => {
   return ctx.reply(`Language was changed`, {reply_markup: Markup.keyboard(mainMenu('ko'))})
});

http.createServer((request, response) => {
    response.statusCode = 200;
    response.write('Hello World');
    response.end();
}).listen(8080);
bot.launch();

