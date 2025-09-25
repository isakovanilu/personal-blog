#!/usr/bin/env node

const datetime = require('datetime');

// Get today's date in YYYY-MM-DD format
const today = new Date();
const formattedDate = today.getFullYear() + '-' + 
  String(today.getMonth() + 1).padStart(2, '0') + '-' + 
  String(today.getDate()).padStart(2, '0');

console.log(formattedDate);
