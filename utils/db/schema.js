// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const db = require('../utils').knex

// Create 'users' table if it does not exist
db.schema.hasTable('users').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('users', function (table) {
      table.increments()
      table.unique('username')
      table.string('username', 32)
      table.string('password', 120)
      table.string('recovery')
      table.string('secret')
      table.integer('verified').defaultTo(0)
      table.string('role')
      table.string('currency').defaultTo('LTC')
      table.string('timezone').defaultTo('Europe/Andorra')
      table.integer('terms').defaultTo(0)
      table.datetime('seen')
      table.string('address', 99)
      table.decimal('availableBalance', 24, 2).defaultTo(0)
      table.decimal('lockedBalance', 24, 2).defaultTo(0)
      table.datetime('created').defaultTo(db.fn.now())
      table.boolean('frozen').defaultTo(false)
      table.boolean('banned').defaultTo(false)
      table.boolean('deleted').defaultTo(false)
    })
  }
})

// Create 'items' table if it does not exist
db.schema.hasTable('items').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('items', function (table) {
      table.increments()
      table.unique('paymentId')
      table.integer('userId')
      table.string('name', 32)
      table.string('description', 1024)
      table.decimal('amount', 24, 2).defaultTo(0)
      table.string('paymentId', 187)
      table.integer('downloads').defaultTo(0)
      table.integer('deleted').defaultTo(0)
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})

// Create 'orders' table if it does not exist
db.schema.hasTable('orders').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('orders', function (table) {
      table.increments()
      table.integer('userId')
      table.integer('itemId')
      table.string('address', 99)
      table.string('transactionHash', 64)
      table.integer('confirms').defaultTo(0)
      table.integer('deleted').defaultTo(0)
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})

// Create 'activity' table if it does not exist
db.schema.hasTable('activity').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('activity', function (table) {
      table.increments()
      table.integer('userId')
      table.integer('itemId')
      table.integer('orderId')
      table.string('method')
      table.string('status')
      table.integer('notify').defaultTo(1)
      table.integer('seen').defaultTo(0)
      table.integer('deleted').defaultTo(0)
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})