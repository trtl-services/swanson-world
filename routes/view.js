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

// Market View
router.get('/:id',
[
  check('id')
  .not().isEmpty()
  .isInt()
],
validateInput,
async function(req, res, next) {
  try {

    const getItem = await db('items')
    .leftJoin('users', 'users.id', 'items.userId')
    .select('users.username', 'items.id', 'items.name', 'items.description', 'items.price', 'items.overview', 'items.license', 'items.views', 'items.purchases', 'items.updated', 'items.created', 'items.reviewed')
    .where('items.id', req.params.id)
    .whereNot('items.deleted', 1)
    //.whereNot('items.reviewed', 0)
    .limit(1)

    const sfee = await TS.getFee(getItem[0].price)
    getItem[0].price = (getItem[0].price + sfee + 0.1).toFixed(2)

    getItem[0].updated = moment(getItem[0].updated).format('DD-MM-YYYY')
    getItem[0].created = moment(getItem[0].created).format('DD-MM-YYYY')


    //Update View count
    await db('items')
    .update({
      views: db.raw('views + ?', [1])
    })
    .where('id', req.params.id)
    .limit(1)

    res.render('public/item', {
      title: getItem[0].name,
      user: (req.user) ? req.user : undefined,
      marked: require('marked'),
      item: getItem[0]
    })
  }
  catch(err) {
    next(err)
  }
})


module.exports = router
