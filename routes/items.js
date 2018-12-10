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
const crypto = require('crypto')
const TS = require('../utils/utils').trtlServices

// Items View
router.get('/', permission(), async function(req, res, next) {
  try {

    const getItems = await db('items')
    .select('name', 'description', 'views', 'purchases', 'downloads', 'created')
    .where('userId', req.user.id)
    .whereNot('deleted', 1)

    getItems.forEach(function(item) {
      item.created = moment(item.created).format('DD-MM-YYY')
    })

    res.render('items', {
      title: 'Items',
      user: (req.user) ? req.user : undefined,
      items: getItems
    })
  }
  catch(err) {
    next(err)
  }
})

// Items View
router.get('/new', permission(), function(req, res, next) {
  try {
    res.render('items/new', {
      title: 'New Item',
      user: (req.user) ? req.user : undefined
    })
  }
  catch(err) {
    next(err)
  }
})

router.post('/new', permission(),
  [
    check('name')
    .not().isEmpty()
    .trim(),

    check('description')
    .not().isEmpty()
    .trim()
    .unescape(),

    check('category')
    .not().isEmpty(),

    check('price')
    .not().isEmpty()
    .isFloat(),

    check('content')
    .not().isEmpty()
    .unescape(),

    check('license')
    //.not().isEmpty()

  ],
  validateInput,
  async function(req, res, next) {
    try {

      const paymentId = crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex')
      .slice(0, 64) 

      const integratedAddress = await TS.integratedAddress(req.user.address, paymentId)

      await db('users')
        .insert({
            userId: req.user.id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            content: req.body.content,
            license: req.body.license,
            paymentId: paymentId,
            integratedAddress: integratedAddress
        })

      res.redirect('/items')
    } catch (err) {
      req.flash('error', 'An error occured adding a new item.')
      res.redirect('/items')
    }
  })

module.exports = router
