const logger = require('../logger')
module.exports = (client) => {
  logger.info(`${client.user.username} is ready.`)
}