// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()
const permission = require('permission')
const db = require('../utils/utils').knex
const moment = require('moment')

// Dashboard view
router.get('/', permission(), async function(req, res, next) {
  try {
    const getApps = await db('apps')
    .leftJoin('wallets', 'wallets.id', 'apps.walletId')
    .leftJoin('monitor', 'monitor.walletId', 'apps.walletId')
    .select('apps.id', 'apps.name', 'apps.domain', 'apps.ipAddress', 'wallets.name as wallet', 'wallets.id as walletId', 'monitor.status', 'monitor.updated')
    .where('apps.userId', req.user.id)
    .whereNot('apps.deleted', 1)

    // If status is 10 minutes old, offline
    getApps.forEach(function(app) {

      const duration = moment.duration(moment().diff(moment(app.updated)))
      if (duration.asMinutes() > 10) {
        app.status = 2
      }
      app.updated = moment(app.updated).fromNow()
    })

    const getWallets = await db('wallets')
    .select('wallets.id', 'wallets.name', 'wallets.label')
    .where('wallets.userId', req.user.id)
    .whereNot('wallets.deleted', 1)
    .whereNotExists(function() {
      this.select('*').from('apps').whereRaw('wallets.id = apps.walletId');
    })

    const countWallets = await db('wallets')
    .count('wallets.id as count')
    .where('userId', req.user.id)
    .whereNot('deleted', 1)

    const countAddresses = await db('addresses')
    .leftJoin('wallets', 'wallets.id', 'addresses.walletId')
    .count('addresses.id as count')
    .where('wallets.userId', req.user.id)
    .whereNot('wallets.deleted', 1)
    .whereNot('addresses.deleted', 1)

    const countTx = await db('transactions')
    .leftJoin('addresses', 'addresses.id', 'transactions.addressId')
    .leftJoin('wallets', 'wallets.id', 'addresses.walletId')
    .count('transactions.id as count')
    .where('wallets.userId', req.user.id)
    .whereNot('addresses.deleted', 1)
    .whereNot('wallets.deleted', 1)
    .whereNot('transactions.deleted', 1)

    const stats = {
      apps: getApps.length,
      wallets: countWallets[0].count,
      addresses: countAddresses[0].count,
      transactions: countTx[0].count
    }

    res.render('dashboard', {
      title: 'Dashboard',
      user: (req.user) ? req.user : undefined,
      stats: stats,
      apps: getApps,
      wallets: getWallets
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
