const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')

module.exports = class PingCommand extends Command {
  constructor() {
    super('ping', {
      name: 'Ping',
      description: 'Ping command',
      module: 'misc',
      ownerOnly: false
    })
  }
  /**
   * Run the command
   * @param {Object[]} args - Arguments
   * @param {Message} msg - Message that triggered the command
   * @param {CommandAPI} api - Command API
   */
  async run(args, msg, api) {
    let embed = api.success(`🏓 Pong\nPing: ${api.handler.client.ping.toFixed(0)} ms`, msg.author)
    return embed
  }
}