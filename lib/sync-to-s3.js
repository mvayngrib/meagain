const { processLog } = require('./process-log')
const { getFilenameForTimeRange, createLogger } = require('./utils')
const { unitToMillis } = require('./constants')
const logger = createLogger()

const noop = () => {}
const sync = ({
  log,
  s3Store,
  resolution='hour',
  onSync=noop,
}) => {
  const getBatchKey = batch => {
    const first = batch[0]
    const filename = getFilenameForTimeRange(first.time, resolution)
    return `${filename}.json`
  }

  const getBatchValue = batch => ({
    start: batch[0].time,
    end: batch[batch.length - 1].time,
    resolution,
    items: batch,
  })

  return processLog({
    log,
    batchSizeInMillis: unitToMillis[resolution],
    processBatch: async batch => {
      const key = getBatchKey(batch)
      logger.info('syncing batch to s3', {
        key,
        items: batch.length,
      })

      const value = getBatchValue(batch)
      await s3Store.put(key, value)
      onSync({ key, value })
    }
  })
}

module.exports = {
  sync,
}
