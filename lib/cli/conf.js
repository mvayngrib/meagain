const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const inquirer = require('inquirer')
const withDefaults = require('lodash/defaults')
const defaults = require('../defaults')
const { prettify } = require('../utils')
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
      message: 'Select your S3 bucket',
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
      message: 'what prefix in this bucket should data be stored at?',
      when: ({ storeInS3 }) => storeInS3,
    }
  ])

  if (bucket) {
    conf.store = {
      s3: {
        profile: awsProfile,
        bucket,
        prefix,
      }
    }
  }

  mkdirp.sync(path.dirname(confPath))
  fs.writeFileSync(confPath, prettify(conf))
}
