module.exports = async (client, handler, msg) => {
  // TODO: DB initializing for user & guild
  await handler.onMessage(msg, msg.author, msg.guild)
}