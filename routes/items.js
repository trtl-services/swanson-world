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
    check('termOne')
    .not().isEmpty(),

    check('termTwo')
    .not().isEmpty(),

    check('termThree')
    .not().isEmpty()
  ],
  validateInput,
  async function(req, res, next) {
    try {
      await db('users')
        .update({
          terms: 1
        })
        .where('id', req.user.id)
        .limit(1)

      res.redirect('/dashboard')
    } catch (err) {
      req.flash('error', 'Please agree to all terms.')
      res.redirect('/welcome')
    }
  })

module.exports = router
