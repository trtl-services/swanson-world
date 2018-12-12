// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()
const db = require('../utils/utils').knex
const setHeader = require('../middleware/setHeader')
const TS = require('../utils/utils').trtlServices

// Webhook
router.post('/', setHeader, async function (req, res) {
  try {
    if (req.headers['authorization'] != process.env.WEBHOOK_TOKEN) {
      throw ('Incorrect access token.')
    }

    else if (req.query.type === 'send') {

      const getUser = await db('users')
      .select('id')
      .where('address', req.body.addressFrom)
      .limit(1)

      const insertTx = await db('transactions')
      .insert({
          userId: getUser[0].id,
          type: 'out',
          amount: req.body.description,
          amount: req.body.amount,
          fee: +req.body.fee + +req.body.sfee, 
          transactionHash: req.body.transactionHash,
          confirms: req.body.confirms
        })

      // Update balance
      const getAddress = await TS.getAddress(req.body.addressFrom)

      await db('users')
      .update({
        availableBalance: getAddress.availableBalance,
        lockedBalance: getAddress.lockedBalance
      })
      .where('id', getUser[0].id)
      .limit(1)
        
      // Log Withdrawal 
      await db('activity')
      .insert({
        userId: getUser[0].id,
        txId: insertTx[0],
        method: 'withdraw',
        status: 'completed',
        notify: 1
      })

    }
    else if (req.query.type === 'receive') {

      const getUser = await db('users')
      .select('id')
      .where('address', req.body.address)
      .limit(1)

      const insertTx = await db('transactions')
      .insert({
          userId: getUser[0].id,
          type: 'in',
          amount: req.body.description,
          amount: req.body.amount,
          fee: +req.body.fee, 
          transactionHash: req.body.transactionHash,
          confirms: req.body.confirms
        })

      // Update balance
      const getAddress = await TS.getAddress(req.body.address)

      await db('users')
      .update({
        availableBalance: getAddress.availableBalance,
        lockedBalance: getAddress.lockedBalance
      })
      .where('id', getUser[0].id)
      .limit(1)
        
      // Log Deposit 
      await db('activity')
      .insert({
        userId: getUser[0].id,
        txId: insertTx[0],
        method: 'deposit',
        status: 'completed',
        notify: 1
      })
    }
    else if (req.query.type === 'confirm') {

      const getTx = await db('transactions')
        .join('users', 'transactions.userId', 'users.id')
        .select('transactions.id', 'transactions.userId', 'users.address')
        .where('transactionHash', req.body.transactionHash)
        .where('transactions.type', req.body.type)
        .limit(1)

        if (getTx.length >= 1) {

          // Update Confirm
          await db('transactions')
            .update({
              confirms: req.body.confirms
            })
            .where('id', getTx[0].id)
            .limit(1)
  
          // If required confirms passed 
          if (req.body.confirms >= process.env.CONFIRMS) {
  
            // Update balance
            const getAddress = await TS.getAddress(getTx[0].address)
  
            await db('users')
            .update({
              availableBalance: getAddress.availableBalance,
              lockedBalance: getAddress.lockedBalance
            })
            .where('id', getTx[0].userId)
            .limit(1)

            //Update Tx
            const viewTx = await TS.getTransfer(req.body.transactionHash)
  
            const result = viewTx.filter(tx => {
              return tx.type === req.body.type
            })
  
            await db('transactions')
            .update({
              confirms: result[0].confirms
            })
            .where('id', getTx[0].id)
            .limit(1)
  
            // Log Confirm
            await db('activity')
            .insert({
              userId: getTx[0].userId,
              txId: getTx[0].id,
              method: 'confirm',
              status: 'completed',
            })
          }
        } 
    }
    else if (req.query.type === 'failure') {

      const getTx = await db('transactions')
      .join('users', 'transactions.accountId', 'users.id')
      .select('transactions.id', 'transactions.userId', 'users.address')
      .where('transactionHash', req.body.transactionHash)
      .where('transactions.type', req.body.type)
      .limit(1)

    if (getTx.length >= 1) {

      // Delete Tx
      await db('transactions')
      .update({
        deleted: 1
      })
      .where('id', getTx[0].id)
      .limit(1)

      // Log Delete
      await db('activity')
      .update({
        method: 'failed',
        status: 'completed',
      })
      .where('transactionId',getTx[0].id)

      // Update balance
      const getAddress = await TS.getAddress(getTx[0].address)

      await db('users')
      .update({
        availableBalance: getAddress.availableBalance,
        lockedBalance: getAddress.lockedBalance
      })
      .where('id', getTx[0].userId)
      .limit(1)
      }
    }

    res.status(201).json({
      status: true
    })
  }
  catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
})


module.exports = router
