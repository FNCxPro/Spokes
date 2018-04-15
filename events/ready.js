const logger = require('../logger')
module.exports = (client) => {
  logger.info(`${client.user.username} is ready.`)
  global.logchan = client.channels.get('435159402463625225')
}