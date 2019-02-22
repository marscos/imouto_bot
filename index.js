if (process.env.BOT_KEY === undefined) require('dotenv').config()
const Telegram = require('telegraf/telegram')
const { json } = require('micro')
const imouto = require('./src/imouto')

const bot = new Telegram(process.env.BOT_KEY)

bot.getMe().then((bot_informations) => {
    console.log("Server has initialized bot nickname. Nick: "+bot_informations.username)
})

bot.setWebhook(process.env.ORIGIN)

async function handler(request, response) {
    const { inline_query } = await json(request)
    if (inline_query && inline_query.query) {
        const results = await imouto(inline_query.query)
        bot.answerInlineQuery(inline_query.id, results)
    }

    return ''
}

module.exports = handler