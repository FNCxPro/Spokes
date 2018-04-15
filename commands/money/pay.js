const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')

module.exports = class PayCommand extends Command {
  constructor() {
    super('pay', {
      name: 'Pay',
      description: 'Pay someone money',
      module: 'money',
      ownerOnly: false,
      guildOnly: true,
      args: [{
        name: 'target',
        type: 'user',
        description: 'The person you want to pay',
        required: true
      }, {
        name: 'amount',
        type: 'string',
        description: 'How much you want to pay',
        required: true
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
    const amount = isNaN(args.amount.value) ? 0 : parseInt(args.amount.value) 
    const me = await db.getUser(msg.author)
    const _target = args.target.value
    const target = await db.getUser(_target)
    if (amount < 1) return api.error(`You cannot pay someone a negative amount.`).setTitle('💵 `Money`')
    if (me.money < amount) return api.error(`You do not have enough money to complete the transaction.\nYou only have **$${me.money}**, but you need **$${amount - me.money}**!`).setTitle('💵 `Money`')
    await me.takeMoney(amount)
    await target.giveMoney(amount)
    const embed = api.success(`The transaction completed successfully. Your balance is **$${me.money.toString()}**\n${_target.username} now has **$${target.money}**!`, msg.author).setTitle('💵 `Money`')
    logchan.send({embed: api.success(`<@${msg.author.id}> (${msg.author.username}#${msg.author.discriminator}) paid <@${_target.id}> (${_target.username}#${_target.discriminator}) **$${amount.toString()}**`).setTitle('💵 `Money`')})
    return embed  
  }
}