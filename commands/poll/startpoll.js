const { Command } = require('../../handler')
const { Emoji } = require('../../handler/Constants')
const polls = {}
module.exports = class PingCommand extends Command {
  constructor() {
    super('startpoll', {
      name: 'Startpoll',
      description: 'Some cambridge analytica shit',
      module: 'poll',
      ownerOnly: true,
      guildOnly: true,
      args: [{
        name: 'question',
        type: 'string',
        required: true,
        multiword: true
      }]
    })
  }
  postConstruct(handler) {
    const check = '404568151783637002'
    const cross = '404568151842357248'
    const cap = 2
    const reactionHandler = (reaction, user) => {
      console.log(reaction.message.channel.id !== '434970722201501706')
      console.log(user.id == user.client.user.id)
      if (reaction.message.channel.id !== '434970722201501706') return
      if (user.id == user.client.user.id) return
      if (reaction.emoji.id === check) {
        if (polls[reaction.message.id].noArr.indexOf(user.id) !== -1) {
          polls[reaction.message.id].yes
          delete polls[reaction.message.id].noArr.indexOf(user.id)
        }
        polls[reaction.message.id].yes = reaction.count - 1
        polls[reaction.message.id].yesArr.push(user.id)
      } else if (reaction.emoji.id === cross) {
        polls[reaction.message.id].noArr.push(user.id)
        polls[reaction.message.id].no = polls[reaction.message.id].noArr
      }
      let count = polls[reaction.message.id].yes + polls[reaction.message.id].no
      console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-')
      console.log(reaction.emoji.name)
      console.log(count)
      console.log(cap)
      console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-')
      if (count === cap) {
        let phrase = 'It was a tie!'
        if (polls[reaction.message.id].yes > polls[reaction.message.id].no) {
          phrase = 'Yes won!'
        } else if (polls[reaction.message.id].yes < polls[reaction.message.id].no) {
          phrase = 'No won!'
        }
        let chan = reaction.message.channel
        reaction.message.delete()
        chan.send(`Vote started by ${polls[reaction.message.id].user.username}#${polls[reaction.message.id].user.discriminator}\n**Question--**\n${polls[reaction.message.id].reason}\n**Yes:** ${polls[reaction.message.id].yes}\n**No:** ${polls[reaction.message.id].no}\n**${phrase}`)
        delete polls[reaction.message.id]
      }
    }
    this.handler.client.on('messageReactionAdd', reactionHandler)
    this.handler.client.on('messageReactionRemove', reactionHandler)
  }
  async preRun(msg) {
    return msg.member.roles.has('434922947522723840')
  }
  async run(args, msg, api) {
    const question = args.question.value
    let embed = api.success(`^ ^ ^ ^ ^ ^ ^ ^ ^ ^\nA vote was started by ${msg.author.username}#${msg.author.discriminator}.\n**-- Question --**\n${question}\nReact with ${Emoji.check} for yes\nReact with ${Emoji.cross} for no`, msg.author)
    const pollchan = msg.guild.channels.get('434970722201501706')
    const mesg = await pollchan.send({embed})
    await mesg.react('404568151783637002')
    await mesg.react('404568151842357248')
    polls[mesg.id] = {
      question,
      user: msg.author,
      yes: 0,
      no: 0
    }
  }
}