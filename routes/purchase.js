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
const TS = require('../utils/utils').trtlServices


// Purchase View
router.get('/:id', permission(),
[
  check('id')
  .not().isEmpty()
  .isInt()
],
validateInput,
async function(req, res, next) {
  try {

    const getItem = await db('items')
    .select('name', 'description', 'price', 'license', 'purchases', 'updated', 'reviewed')
    .where('id', req.params.id)
    .whereNot('deleted', 1)
    //.whereNot('reviewed', 0)
    .limit(1)

    getItem[0].price =  getItem[0].price.toFixed(2)
    getItem[0].sfee = await TS.getFee(getItem[0].price)
    getItem[0].fee = 0.1.toFixed(2)
    getItem[0].total = (+getItem[0].price + +getItem[0].sfee + +getItem[0].fee).toFixed(2)

    getItem[0].updated = moment(getItem[0].updated).format('DD-MM-YYYY')
    getItem[0].created = moment(getItem[0].created).format('DD-MM-YYYY')

    res.render('public/purchase', {
      title: getItem[0].name,
      user: (req.user) ? req.user : undefined,
      item: getItem[0]
    })
  }
  catch(err) {
    next(err)
  }
})


// Market View
router.post('/', permission(),
[
  check('id')
  .not().isEmpty()
  .isInt()
],
validateInput,
async function(req, res, next) {
  try {

    const getItem = await db('items')
    .select('userId', 'price')
    .where('id', req.body.id)
    .whereNot('deleted', 1)
    //.whereNot('reviewed', 0)
    .limit(1)

    const getSeller = await db('users')
    .select('address')
    .where('id', getItem[0].userId)
    .limit(1)

    const amount = Number(getItem[0].price)
    const fee = Number(0.1)
 
    // Execute transfer
    const createTransfer = await TS.createTransfer(req.user.address, getSeller[0].address, amount, fee)

    //Create a Order
    const createOrder = await db('orders')
    .insert({
      userId: req.user.id,
      itemId: req.body.id,
      transactionHash: createTransfer.transactionHash
    })

    req.flash('success', 'Transaction send. Download will be available upon ' + process.env.CONFIRMS + ' confirms.')
    res.redirect('/view/' + req.body.id)
  } catch (err) {
    console.log(err)
    req.flash('error', err)
    res.redirect('/view/' + req.body.id)
  }
})

module.exports = router
