const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const inquirer = require('inquirer')
const withDefaults = require('lodash/defaults')
const defaults = require('../defaults')
const { prettify, splitCamelCase } = require('../utils')
const { unitToMillis } = require('../constants')
const getProfiles = require('../aws/get-profiles')
const createS3Client = require('../aws/s3-client')

module.exports = async (confPath) => {
  let conf
  try {
    conf = require(confPath)
  } catch (err) {
    conf = {}
  }

  conf.monitor = withDefaults(conf.monitor, defaults.monitor)
  const {
    awsProfile,
    bucket,
    prefix,
    resolution,
  } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'storeInS3',
      message: 'do you have an AWS account set up for storage?'
    },
    {
      type: 'list',
      name: 'awsProfile',
      message: 'Select your aws profile',
      when: ({ storeInS3 }) => storeInS3,
      choices: getProfiles()
    },
    {
      type: 'list',
      name: 'bucket',
      message: 'what S3 bucket should I sync data to?',
      when: ({ storeInS3 }) => storeInS3,
      choices: async ({ awsProfile }) => {
        const client = createS3Client(awsProfile)
        const { Buckets } = await client.listBuckets().promise()
        return Buckets.map(({ Name }) => Name)
      }
    },
    {
      type: 'input',
      name: 'prefix',
      default: defaults.s3Prefix,
      message: 'what path prefix in this bucket should I use?',
      when: ({ storeInS3 }) => storeInS3,
    },
    {
      type: 'list',
      name: 'resolution',
      default: defaults.s3Prefix,
      message: 'how often should I sync to s3?',
      when: ({ storeInS3 }) => storeInS3,
      choices: Object.keys(unitToMillis).map(value => ({
        name: splitCamelCase(value).toLowerCase(),
        value,
      }))
    },
  ])

  if (bucket) {
    conf.store = {
      s3: {
        profile: awsProfile,
        bucket,
        prefix,
        resolution,
      }
    }
  }

  mkdirp.sync(path.dirname(confPath))
  fs.writeFileSync(confPath, prettify(conf))
}
