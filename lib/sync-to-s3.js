const { processLog } = require('./process-log')
const { getFilenameForTimeRange, getItemTime, createLogger } = require('./utils')
const { unitToMillis } = require('./constants')
const logger = createLogger()

const sync = async ({
  log,
  s3Store,
  resolution='hour',
}) => {
  const getBatchKey = batch => {
    const first = batch[0]
    const filename = getFilenameForTimeRange(getItemTime(first), resolution)
    return `${filename}.json`
  }

  const getBatchValue = batch => {
    return {
      start: getItemTime(batch[0]),
      end: getItemTime(batch[batch.length - 1]),
      resolution,
      items: batch,
    }
  }

  return processLog({
    log,
    batchSizeInMillis: unitToMillis[resolution],
    processBatch: async batch => {
      const key = getBatchKey(batch)
      logger.info('syncing batch to s3', {
        key,
        items: batch.length,
      })

      await s3Store.put(key, getBatchValue(batch))
    }
  })
}

module.exports = {
  sync,
}
