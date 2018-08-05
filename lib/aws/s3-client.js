const path = require('path')
const AWS = require('aws-sdk')
const { getHomedir } = require('../utils')

module.exports = profile => {
  const credentials = new AWS.SharedIniFileCredentials({
    profile,
    filename: path.resolve(getHomedir(), '.aws/credentials'),
  })

  AWS.config.credentials = credentials
  return new AWS.S3()
}
