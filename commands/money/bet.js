const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')

module.exports = class BalanceCommand extends Command {
  constructor() {
    super('bet', {
      name: 'Bet',
      description: 'Bet some money',
      module: 'money',
      ownerOnly: false,
      args: [{
        name: 'amount',
        type: 'number',
        description: 'The amount of money you want to bet',
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
    const amount = args.amount.value
    const me = await db.getUser(msg.author)
    if (amount < 1) return api.error(`You cannot bet someone an amount less than 1.`).setTitle('💵 `Money`')
    if (me.money < amount) return api.error(`You do not have enough money to complete the transaction.\nYou only have **$${me.money}**, but you need **$${amount - me.money}**!`).setTitle('💵 `Money`')
    
    await me.takeMoney(amount)
    const rdm = (Math.random() * 100).toFixed(0)
    let winAmount = 0
    let multiplier = 0
    if (rdm < 2) {
      winAmount = amount * 100
      multiplier = 100
    } else if (rdm < 5) {
      winAmount = amount * 1.25
      multiplier = 1.25
    } else if (rdm < 45) {} else if (rdm < 50) {
      winAmount = amount * 1.35
      multiplier = 1.35
    } else if (rdm < 75) {
      winAmount = amount * 1.05
      multiplier = 1.05
    } else if (rdm < 98) {} else if (rdm < 101) {
      winAmount = amount * 95
      multiplier = 95
    }
    if (winAmount > 0) await me.giveMoney(winAmount)
    let embed = (winAmount > 0 ? api.success(`You won **$${winAmount}**!\nYour balance is now **$${me.money}**\nYour lucky number is **${rdm}**.`, msg.author) : api.error(`You lost **$${amount}**.\nYour new balance is **$${me.money}**.\nYour unlucky number is **${rdm}**`))
    embed.setTitle('💵 `Money`')
    return embed
  }
}