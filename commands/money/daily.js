const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const moment = require('moment')
const db = require('../../db')

module.exports = class DailyCommand extends Command {
  constructor() {
    super('daily', {
      name: 'Daily',
      description: 'Get your daily money',
      module: 'money',
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
    const me = await db.getUser(msg.author)
    const now = moment()
    const ld1D = me.lastDaily.add(1, 'day')
    if (now.unix() > ld1D.unix()) {
      me.lastDaily = now
      await me.giveMoney(500)
      return api.success(`You have received **$500** as a daily reward!`, msg.author).setTitle('💵 `Money`')
    } else {
      return api.error(`You cannot receive your daily reward **${ld1D.fromNow()}**.`, msg.author).setTitle('💵 `Money`')
    }
  }
}