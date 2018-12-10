// Copyright (c) 2018, Fexra, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.
'use strict'

const TRTLServices = require('ts-api-js')

const trtlServices = new TRTLServices({
  token: process.env.TS_API_TOKEN,
  timeout: 5000
})

module.exports = trtlServices
