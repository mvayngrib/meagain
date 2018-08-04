const util = require('util')
// const changes = require('changes-feed')

const zlib = require('zlib')
const gzip = util.promisify(zlib.gzip.bind(zlib))
const { getEventKey } = require('../utils')

const getS3Url = ({ bucket, prefix }) => {
  let url = `https://s3.console.aws.amazon.com/s3/buckets/${bucket}/${prefix}`
  if (prefix.length) url += '/'
  url += '?tab=overview'

  return url
}

module.exports = ({ client, bucket, prefix='' }) => {
  if (!(client && bucket)) {
    throw new Error('expected "client" and "bucket"')
  }

  const putObject = params => client.putObject({
    Bucket: bucket,
    ...params,
  }).promise()

  // trim tailing slashes
  prefix = prefix.replace(/\/+$/, '')

  const put = async event => {
    const eventKey = getEventKey(event)
    const zipped = await gzip(JSON.stringify(event))
    return putObject({
      Key: `${prefix}/${eventKey}`,
      Body: zipped,
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
    })
  }

  const baseUrl = getS3Url({ bucket, prefix })
  const toString = () => baseUrl

  return {
    put,
    toString,
  }
}
