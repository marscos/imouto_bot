import Telegraf from 'telegraf'

const { telegram } = new Telegraf(process.env.BOT_KEY)

telegram.getMe().then(bot_informations => {
  console.log(`${bot_informations.username} online`)
})

telegram.setWebhook(process.env.ORIGIN)
