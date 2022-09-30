import Telegram from 'telegraf'

const bot = new Telegram(process.env.BOT_KEY)

bot.getMe().then(bot_informations => {
  console.log(`${bot_informations.username} online`)
})

bot.setWebhook(process.env.ORIGIN)
