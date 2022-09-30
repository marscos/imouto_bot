import dotenv from 'dotenv'
if (process.env.BOT_KEY === undefined) dotenv.config()
import { json } from 'micro'
import imouto from './imouto.js'

export default async (request, response) => {
  const { inline_query } = await json(request)
  if (inline_query && inline_query.query) {
    let offset = inline_query.offset ? parseInt(inline_query.offset) : 1
    const results = await imouto(offset, inline_query.query)
    bot.answerInlineQuery(inline_query.id, results, {
      next_offset: (offset + 1).toString()
    })
    return response.status(200).json(results)
  }

  return ''
}
