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

// Market View
router.get('/', async function(req, res, next) {
  try {

    const getItems = await db('items')
    .select('id', 'name', 'description', 'price', 'views', 'purchases', 'filesize', 'created', 'reviewed')
    .where('userId', req.user.id)
    .whereNot('deleted', 1)
    //.whereNot('reviewed', 0)

    getItems.forEach(function(item) {
      item.price = item.price.toFixed(2)
      item.created = moment(item.created).format('DD-MM-YYY')
    })

    res.render('public/browse', {
      title: 'Browse',
      user: (req.user) ? req.user : undefined,
      items: getItems
    })
  }
  catch(err) {
    next(err)
  }
})

module.exports = router
