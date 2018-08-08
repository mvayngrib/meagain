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
const CREATE_NEW_BUCKET = '<create new bucket>'

module.exports = async (confPath) => {
  let conf
  try {
    conf = require(confPath)
  } catch (err) {
    conf = {}
  }

  const whenStoreInS3 = ({ storeInS3 }) => storeInS3

  conf.monitor = withDefaults(conf.monitor, defaults.monitor)
  const {
    awsProfile,
    bucket,
    newBucket,
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
      when: whenStoreInS3,
      choices: getProfiles()
    },
    {
      type: 'list',
      name: 'bucket',
      message: 'what S3 bucket should I sync data to?',
      when: whenStoreInS3,
      choices: async ({ awsProfile }) => {
        const client = createS3Client(awsProfile)
        const { Buckets } = await client.listBuckets().promise()
        const names = Buckets.map(({ Name }) => Name)
        return [CREATE_NEW_BUCKET].concat(names)
      }
    },
    {
      type: 'input',
      name: 'newBucket',
      message: 'what shall I name the bucket?',
      when: ({ bucket }) => bucket === CREATE_NEW_BUCKET,
      validate: async (newBucket, { awsProfile }) => {
        const client = createS3Client(awsProfile)
        const params = {
          Bucket: newBucket,
          ACL: 'private',
        }

        await client.createBucket(params).promise()
        return true
      }
    },
    {
      type: 'input',
      name: 'prefix',
      default: defaults.s3Prefix,
      message: 'what path prefix in this bucket should I use?',
      when: whenStoreInS3,
    },
    {
      type: 'list',
      name: 'resolution',
      default: defaults.s3Prefix,
      message: 'how often should I sync to s3?',
      when: whenStoreInS3,
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
        bucket: newBucket || bucket,
        prefix,
        resolution,
      }
    }
  }

  mkdirp.sync(path.dirname(confPath))
  fs.writeFileSync(confPath, prettify(conf))
}
