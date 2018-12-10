// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const db = require('../utils/utils').knex

async function checkAlerts(req, res, next) {
  try {
    if(req.user) {
      const getAlerts = await db('alerts')
      .count('id as count')
      .where('userId', req.user.id)
      .where('seen', 0)

    res.locals.alertCount = getAlerts[0].count
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = checkAlerts
