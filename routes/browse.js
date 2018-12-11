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
router.get('/', permission(), async function(req, res, next) {
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

    res.render('browse', {
      title: 'Browse',
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

    const getLicenses = require('../utils/licenses.json')

    res.render('items/new', {
      title: 'New Item',
      user: (req.user) ? req.user : undefined,
      licenses: getLicenses.licenses
    })
  }
  catch(err) {
    next(err)
  }
})

router.post('/new', permission(), upload.single('file'),
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
  .not().isEmpty()

],
validateInput,
async function(req, res, next) {
  try {

    if(req.file.mimetype !== 'application/zip') {
      throw (new Error('File has to be a zip archive.'))
    }

    // Generate integrated Address
    const paymentId = await crypto.randomBytes(32).toString('hex')
    
    const integratedAddress = await TS.integrateAddress(req.user.address, paymentId)

    // Insert Item
    const insertItem = await db('items')
    .insert({
        userId: req.user.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        content: req.body.content,
        license: req.body.license,
        paymentId: paymentId,
        integratedAddress: integratedAddress.address,
        filename: req.file.filename,
        filesize: req.file.size
    })
  
    // Log Item 
    await db('activity')
    .insert({
      userId: req.user.id,
      itemId: insertItem[0],
      method: 'publish',
      status: 'completed',
      message: '',
      notify: 1
    })

    req.flash('success', 'Item has been submitted and is under review.')
    res.redirect('/items')
  } catch (err) {
    console.log(err)
    req.flash('error', 'An error occured adding a new item.')
    res.redirect('/items')
  }
})

module.exports = router
