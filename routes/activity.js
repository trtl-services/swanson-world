// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()
const permission = require('permission')
const db = require('../utils/utils').knex
const { check } = require('express-validator/check')
const validateInput = require('../middleware/validateInput')
const moment = require('moment')
require('moment-timezone')
require('csv-express')

// Activity Redirect
router.get('/', permission(), async function(req, res, next) {
  res.redirect('/activity/0/10')
})

// Activity View
router.get('/:start/:end', permission(),
[
  check('start')
  .not().isEmpty()
  .isInt(),

  check('end')
  .not().isEmpty()
  .isInt()
],
validateInput,
async function(req, res, next) {
  try {
    const start = +req.params.start
    const end = +req.params.end
    const limit = end - start

    if (limit > 50) {
      res.redirect('/activity/0/50')
    }

    const next = end + '/' + (end + limit)
    let prev

    if (start === 0) {
      prev = '0/10'
    } else {
      prev = (start - limit) + '/' + start
    }

    const getActivities = await db('activity')
      .select('id', 'method', 'status', 'message', 'progress', 'created')
      .where('userId', req.user.id)
      .whereNot('deleted', 1)
      .whereNot('notify', 0)
      .orderBy('created', 'desc')
      .orderBy('id', 'desc')
      .whereNull('activity.walletId')
      .limit(limit)
      .offset(start)

      const countActivities = await db('activity')
      .count('id as count')
      .where('userId', req.user.id)
      .whereNot('deleted', 1)
      .whereNot('notify', 0)
      .whereNull('activity.walletId')

    getActivities.forEach(async function(value) {
      if (value.method === 'login') {
        value.event = {
          title: 'Login',
          icon: 'login',
          color: 'warning'
        }
      } else if (value.method === 'createWallet') {
        value.event = {
          title: 'Wallet Creation',
          icon: 'wallet',
          color: 'success'
        }
      } else if (value.method === 'modifyWallet') {
        value.event = {
          title: 'Wallet Modification',
          icon: 'wallet',
          color: 'warning'
        }
      } else if (value.method === 'deleteWallet') {
        value.event = {
          title: 'Wallet Removal',
          icon: 'wallet',
          color: 'danger'
        }
      } else if (value.method === 'createApp') {
        value.event = {
          title: 'App Creation',
          icon: 'grid',
          color: 'success'
        }
      } else if (value.method === 'modifyApp') {
        value.event = {
          title: 'App Modification',
          icon: 'grid',
          color: 'warning'
        }
      } else if (value.method === 'deleteApp') {
        value.event = {
          title: 'App Removal',
          icon: 'grid',
          color: 'danger'
        }
      } else if (value.method === 'createToken') {
        value.event = {
          title: 'Token Creation',
          icon: 'key',
          color: 'success'
        }
      } else if (value.method === 'deleteToken') {
        value.event = {
          title: 'Token Removal',
          icon: 'key',
          color: 'danger'
        }
      } else if (value.method === 'createWebHook') {
        value.event = {
          title: 'Webhook Creation',
          icon: 'globe',
          color: 'success'
        }
      } else if (value.method === 'deleteWebHook') {
        value.event = {
          title: 'Webhook Removal',
          icon: 'globe',
          color: 'danger'
        }
      } else if (value.method === 'createAddress') {
        value.event = {
          title: 'Address Creation',
          icon: 'layers',
          color: 'success'
        }
      } else if (value.method === 'deleteAddress') {
        value.event = {
          title: 'Address Removal',
          icon: 'layers',
          color: 'danger'
        }
      } else if (value.method === 'sendTx') {
        value.event = {
          title: 'Transaction Send',
          icon: 'arrow-up',
          color: 'danger'
        }
      } else if (value.method === 'receiveTx') {
        value.event = {
          title: 'Transaction Received',
          icon: 'arrow-down',
          color: 'success'
        }
      } else if (value.method === 'confirmTx') {
        value.event = {
          title: 'Transaction Confirmed',
          icon: 'puzzle',
          color: 'info'
        }
      }
      else if (value.method === 'failedTx') {
        value.event = {
          title: 'Transaction Failed',
          icon: 'ban',
          color: 'danger'
        }
      }

      if (!value.message) {
        value.message = ''
      }

      value.created = moment(value.created).tz(req.user.timezone).format('YYYY-MM-DD HH:mm')
    })

    res.render('activity', {
      title: 'Activity',
      user: (req.user) ? req.user : undefined,
      activities: getActivities,
      start: start,
      end: end,
      limit: limit,
      total: countActivities[0].count,
      next: next,
      prev: prev
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

// Export CSV
router.post('/export', permission(),
async function(req, res, next) {
  try {
    const getActivities = await db('activity')
      .leftJoin('apps', 'apps.id', 'activity.appId')
      .leftJoin('wallets', 'wallets.id', 'activity.walletId')
      .leftJoin('addresses', 'addresses.id', 'activity.addressId')
      .leftJoin('transactions', 'transactions.id', 'activity.transactionId')
      .select('activity.created', 'apps.name as app', 'wallets.name as wallet', 'addresses.address', 'transactions.transactionHash as hash', 'activity.method', 'activity.progress', 'activity.status', 'activity.message')
      .where('activity.userId', req.user.id)
      .whereNot('activity.deleted', 1)
      .whereNull('activity.walletId')
      .orderBy('activity.created', 'asc')
      .orderBy('activity.id', 'asc')

    getActivities.forEach(async function(value) {
      value.created = moment(value.created).tz(req.user.timezone).format('YYYY-MM-DD HH:mm')
    })

    res.statusCode = 200
    res.setHeader('Content-icon', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'activity_' + req.user.name + '_' + moment().tz(req.user.timezone).format('YYYY-MM-DD') + '.csv')
    res.csv(getActivities, true)
  } catch (err) {
    console.log(err)
    req.flash('error', 'An error occured while exporting your accounts activity.')
    res.redirect('/activity/0/10')
  }
})

// Activity Modal
router.get('/:id', permission(),
[
  check('id')
  .not().isEmpty()
  .isInt()
],
validateInput,
async function(req, res, next) {
  try {

    const getActivity = await db('activity')
      .select('appId', 'walletId', 'addressId', 'transactionId', 'method')
      .where('id', req.params.id)
      .limit(1)

    let data
    // If App
    if (new RegExp('(App)$').test(getActivity[0].method)) {
      const getApp = await db('apps')
        .join('wallets', 'apps.walletId', 'wallets.id')
        .select('apps.name as App', 'wallets.name as wallet as Wallet', 'apps.domain as Domain', 'apps.ipAddress as IP Address')
        .where('apps.id', getActivity[0].appId)
        .limit(1)

      data = getApp[0]
    }
    // If Token
    else if (new RegExp('(Token)').test(getActivity[0].method)) {
      const getToken = await db('tokens')
        .join('apps', 'tokens.appId', 'apps.id')
        .select('apps.name as App', 'tokens.name as Token', 'tokens.expires as Expires', 'tokens.permissions as Permission')
        .where('apps.id', getActivity[0].appId)
        .limit(1)

      data = getToken[0]
    }
    // If WebHook
    else if (new RegExp('(WebHook)').test(getActivity[0].method)) {
      const getToken = await db('webhooks')
        .join('apps', 'webhooks.appId', 'apps.id')
        .select('apps.name as App', 'webhooks.name as Token', 'webhooks.URL', 'webhooks.Timeout')
        .where('apps.id', getActivity[0].appId)
        .limit(1)

      data = getToken[0]
    }
    // If wallet
    else if (new RegExp('(Wallet)').test(getActivity[0].method)) {
      const getWallet = await db('wallets')
        .select('name as Name', 'location as Location', 'host as Host', 'port as Port', 'blockIndex as Height')
        .where('id', getActivity[0].walletId)
        .limit(1)

      data = getWallet[0]
    }
    // If Address
    else if (new RegExp('(Address)').test(getActivity[0].method)) {
      const getAddress = await db('addresses')
        .select('address as Address', 'blockIndex as Height')
        .where('id', getActivity[0].addressId)
        .limit(1)

      data = getAddress[0]
    }
    // If Transaction
    else if (new RegExp('(Tx)').test(getActivity[0].method)) {
      const getTx = await db('transactions')
        .leftJoin('addresses', 'addresses.id', 'transactions.addressId')
        .select('addresses.address as Address', 'transactions.transactionHash as Hash', 'transactions.paymentId as Payment ID', 'transactions.blockIndex as Height')
        .where('transactions.id', getActivity[0].transactionId)
        .limit(1)

      data = getTx[0]
    }

    res.json(data)
  } catch (err) {
    console.log(err)
    res.json(null)
  }
})

module.exports = router
