const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')

module.exports = class BalanceCommand extends Command {
  constructor() {
    super('balance', {
      name: 'Balance',
      description: 'Get your balance',
      module: 'money',
      ownerOnly: false,
      aliases: ['bal', '$', '$$', '$$$'],
      args: [{
        name: 'target',
        type: 'user',
        description: 'The person you want to get a balance of',
        default: true
      }]
    })
  }

  /**
   * Run the command
   * @param {Object[]} args - Arguments
   * @param {Message} msg - Message that triggered the command
   * @param {CommandAPI} api - Command API
   */
  async run(args, msg, api) {
    const _target = args.target.value
    const target = await db.getUser(_target)
    const embed = api.success(`${_target.username} has **$${target.money}**!`, _target)
    embed.setTitle('💵 `Money`')
    return embed
  }
}