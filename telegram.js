import Telegraf from 'telegraf'

const bot = new Telegraf(process.env.BOT_KEY)

bot.telegram.getMe().then(bot_informations => {
  console.log(`${bot_informations.username} online`)
})

bot.telegram.setWebhook(process.env.ORIGIN)
