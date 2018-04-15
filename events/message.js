const db = require('../db')
module.exports = async (client, handler, msg) => {
  // TODO: DB initializing for user & guild
  const user = await db.getUser(msg.author)
  let guild
  if (msg.guild) guild = await db.getGuild(msg.guild)
  await handler.onMessage(msg, user, guild || undefined)
}