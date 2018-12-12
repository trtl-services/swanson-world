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

    // Get transactions that are not present in the order table (must be withraws/deposits)
    const getTxs = await db('transactions')
    .leftJoin('orders', function () {
      this
        .on('transactions.transactionHash', 'orders.transactionHash')
    })
    .select('transactions.*')
    .where('transactions.userId', req.user.id)
    .whereNull('orders.transactionHash')

    getTxs.forEach(function(tx) {
      tx.amount = tx.amount.toFixed(2)
      tx.created = moment(tx.created).format('YYYY-MM-DD')
    })

    res.render('dashboard', {
      title: 'Dashboard',
      user: (req.user) ? req.user : undefined,
      txs: getTxs,
      confirms: process.env.CONFIRMS
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
