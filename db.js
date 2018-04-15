const { User, Guild, GuildMember } = require('discord.js') // For JSDoc purposes

const moment = require('moment')
const config = require('config')
const r = require('rethinkdbdash')(config.get('rethink'))
const cache = {}
const guildCache = {}

/**
 * DUser class
 */
class DUser {
  /**
   * Create a DUser object
   * @param {object} info - Info object from the DB
   * @param {object} r - RethinkDB object
   * @param {User} [user] - Discord.JS user object
   */
  constructor(info, r, user) {
    /**
     * Original info from DB
     * @type {Object}
     */
    this.info = info

    /**
     * RethinkDB object
     * @type {Object}
     */
    this.r = r

    /**
     * Discord.JS user
     * @type {User|undefined}
     */
    this.user = user
    this.init(this.info)
  }
  /**
   * Initialize the DUser object with the data from the DB
   * @param {Object} info - DB info object
   */
  init(info) {
    this.info = info
    /**
     * User's ID
     * @type {string}
     */
    this.id = info.id

    /**
     * Blacklisted
     * @type {boolean}
     */
    this.blacklisted = info.blacklisted || false

    /**
     * User Config
     * @type {Object}
     */
    this.config = info.config || {}

    /**
     * User Bans
     * @type {Object[]}
     */
    this.bans = info.bans || []

    /**
     * User flags
     * @type {Object}
     */
    this.flags = info.flags || {
      developer: false,
      admin: false
    }
    
    /**
     * Last daily
     * @type {Date}
     */
    this.lastDaily = moment(info.lastDaily) || moment(0)

    /**
     * Moneys
     * @type {Number}
     */
    this.money = info.money || 0
  }

  async giveMoney(amount) {
    this.money = this.money + amount
    await this.push()
  }

  async takeMoney(amount) {
    this.money = this.money - amount
    await this.push()
  }

  /**
   * Blacklist the user
   */
  async blacklist() {
    this.blacklisted = true
    await this.push()
  }

  /**
   * Unblacklist the user
   */
  async unblacklist() {
    this.blacklisted = false
    await this.push()
  }

  /**
   * Update the DUser from the DB
   */
  async update() {
    let info = await this.r.table('users').get(this.id).run()
    this.init(info)
  }

  /**
   * Pushes current data of the DUser object to the DB
   */
  async push() {
    let newUser = {
      id: this.id,
      blacklisted: this.blacklisted,
      config: this.config,
      flags: this.flags,
      lastDaily: this.lastDaily.toISOString(),
      money: this.money
    }
    await this.r.table('users').get(this.id).update(newUser).run()
    return true
  }
}

/** 
 * DGuild class
 */
class DGuild {
  /**
   * Create a DGuild object
   * @param {object} info - Info object from the DB
   * @param {object} r - RethinkDB object
   * @param {Guild} [guild] - Discord.JS guild object
   */
  constructor(info, r, guild) {
    /**
     * Original info from DB
     * @type {Object}
     */
    this.info = info

    /**
     * RethinkDB object
     * @type {Object}
     */
    this.r = r

    /**
     * Discord.JS guild
     * @type {Guild|undefined}
     */
    this.guild = guild
    this.init(this.info)
  }

  /**
   * Init the DGuild object
   * @param {object} info - info from DB
   */
  init(info) {
    this.info = info
    /**
     * Guild's ID
     * @type {string}
     */
    this.id = info.id

    /**
     * Guild blacklist status
     * @type {boolean}
     */
    this.blacklisted = info.blacklisted || false

    /**
     * Guild config
     * @type {object}
     */
    this.config = info.config || {}

    /**
     * Guild flags
     * @type {object}
     */
    this.flags = info.flags || {}
    
    /**
     * Guild prefix
     * @type {string}
     */
    this.prefix = info.prefix || '!'

    /**
     * Guild premium status
     * @type {boolean}
     */
    this.premium = info.premium || false
  }
  
  /**
   * Blacklist the guild
   */
  async blacklist() {
    this.blacklisted = true
    await this.push()
  }

  /**
   * Unblacklist the guild
   */
  async unblacklist() {
    this.blacklisted = false
    await this.push()
  }

  /**
   * Set the prefix
   * @param {string} [prefix = 'dbans.'] - New prefix 
   */
  async setPrefix(prefix = 'dbans.') {
    this.prefix = prefix
    await this.push()
  }

  /**
   * Update the DGuild from the DB
   */
  async update() {
    let info = await this.r.table('servers').get(this.id).run()
    this.init(info)
  }

  /**
   * Pushes current data of the DGuild object to the DB
   */
  async push() {
    let newGuild = {
      id: this.id,
      blacklisted: this.blacklisted,
      config: this.config,
      flags: this.flags,
      prefix: this.prefix,
      premium: this.premium
    }
    await this.r.table('servers').get(this.id).update(newGuild).run()
    return true
  }
}

class Database {
  constructor() {
    this.r = r
  }
  async makeUser(id) {
    let newUser = {
      id: id,
      blacklisted: false,
      config: {},
      flags: {
        admin: false,
        developer: false
      },
      lastDaily: 0,
      money: 0
    }
    let res = await this.r.table('users').insert(newUser).run()
    return newUser
  }

  /**
   * Get database information of a user
   * @param {User|GuildMember|string} user - User to get database info from
   * @returns {DUser}
   */
  async getUser(user) {
    let id = user
    if(typeof user !== 'string') id = user.id
    if(cache[id]) return cache[id]
    let i = await this.r.table('users').get(id).run()
    if(typeof i == 'undefined' || !i) {
      await this.makeUser(id)
      return this.getUser(id)
    }
    let duser = new DUser(i, this.r, (user instanceof User ? user : undefined))
    cache[id] = duser
    return duser
  }
  
  async makeGuild(id) {
    let newGuild = {
      id: id,
      blacklisted: false,
      config: {},
      flags: {},
      prefix: '!',
      premium: false
    }
    let res = await this.r.table('servers').insert(newGuild).run()
    return newGuild
  }

  /**
   * Get database information of a guild
   * @param {Guild|string} guild - Guild to get database info from
   * @returns {DGuild}
   */
  async getGuild(guild) {
    let id = guild
    if(typeof guild !== 'string') id = guild.id
    if(guildCache[id]) return guildCache[id]
    let i = await this.r.table('servers').get(id).run()
    if(typeof i == 'undefined' || !i) {
      await this.makeGuild(id)
      return this.getGuild(id)
    }
    let dguild = new DGuild(i, this.r, (guild instanceof Guild ? guild : undefined))
    guildCache[id] = dguild
    return dguild
  }
}
module.exports = new Database()