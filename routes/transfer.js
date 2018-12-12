// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()
const permission = require('permission')
const verify2FA = require('../middleware/verify2FA')
const db = require('../utils/utils').knex
const { check } = require('express-validator/check')
const validateInput = require('../middleware/validateInput')
const moment = require('moment')

// Transferrouter.post('/transfer', permission(), verify2FA,
router.post('/transfer', permission(), verify2FA,
[
  check('address')
  .not().isEmpty()
  .escape()
  .matches(/^(TRTL)/, 'i')
  .isLength({ min: 99, max: 187 }),

  check('amount')
  .not().isEmpty()
  .escape()
  .isDecimal(),

  check('fee')
  .not().isEmpty()
  .trim()
  .escape()
  .isDecimal()
],
validateInput,
async function (req, res, next) {
  try {

    const amount = Number(req.body.amount).toFixed(2)
    const fee = Number(req.body.fee).toFixed(2)      

    const getAddress = await db('users')
      .select('address')
      .where('id', req.user.id)
      .limit(1)

    // Execute transfer
    const newTransfer = await TS.createTransfer(getAddress[0].address, req.body.address, amount, fee)

    if (!newTransfer.error) {
      req.flash('success', 'Transaction succesfully send.')
      res.redirect('/')
    } else {
      throw (new Error(newTransfer.error))
    }
  } catch (err) {
    console.log(err)
    req.flash('error', 'An error occured while sending the transaction.')
    res.redirect('/s')
  }
})

module.exports = router
