
const Promise = require('bluebird')
const util = require('util')
const collect = util.promisify(require('stream-collector'))
const memoize = require('lodash/memoize')
const omit = require('lodash/omit')
const once = require('lodash/once')
const { wait, roundDownToUnit, createLogger } = require('./utils')
const getChangeTime = change => change.value.time

const processLog = ({
  log,
  processBatch,
  batchSizeInMillis,
}) => {
  const logger = createLogger('process-log')
  let start = log.start - 1
  if (!(batchSizeInMillis > 0)) {
    return Promise.reject(new Error('expected number "batchSizeInMillis"'))
  }

  let stopped = false
  const stop = () => {
    stopped = true
    const copy = liveStreams.slice()
    liveStreams.length = 0
    copy.forEach(stream => stream.destroy())
  }

  const liveStreams = []
  const getNextLiveValue = (afterLogIdx) => {
    let stream
    const promise = new Promise((resolve, reject) => {
      stream = log.createReadStream({ since: afterLogIdx, limit: 1, live: true })
        .on('data', data => {
          stream.destroy()
          resolve(data)
        })
        .on('error', reject)

      liveStreams.push(stream)
    })

    promise.cancel = once(() => stream.destroy())
    return promise
  }

  const getNextOld = memoize(async (afterLogIdx) => {
    const results = await collect(log.createReadStream({ since: afterLogIdx, limit: 1 }))
    return results[0]
  })

  const getNextItemBeforeTime = async (afterLogIdx, endTimestamp) => {
    let item = await getNextOld(afterLogIdx)
    if (item) {
      if (getChangeTime(item) < endTimestamp) {
        return item
      }

      return
    }

    let now = Date.now()
    if (endTimestamp < now) {
      // no more items coming in live
      return
    }

    let promiseLive = getNextLiveValue(afterLogIdx)
    let waiter = wait(endTimestamp - now)
    await Promise.race([waiter, promiseLive])

    waiter.cancel()
    if (promiseLive.isFulfilled()) {
      item = await promiseLive
      if (getChangeTime(item) < endTimestamp) {
        return item
      }
    }

    promiseLive.cancel()
  }

  const readTillTime = async (afterLogIdx, endTimestamp) => {
    const batch = []
    let item
    // eslint-disable-next-line no-constant-condition
    while (true) {
      item = await getNextItemBeforeTime(afterLogIdx, endTimestamp)
      if (!item) {
        break
      }

      batch.push(item)
      afterLogIdx = item.change
    }

    return batch
  }

  const run = async () => {
    let next = await getNextOld(start)
    if (!next) {
      next = await getNextLiveValue(start)
    }

    let { change } = next
    let batch
    let checkpoint = roundDownToUnit(getChangeTime(next), batchSizeInMillis)
    do {
      batch = await readTillTime(change, checkpoint + batchSizeInMillis)

      // first
      if (next) {
        batch.unshift(next)
        next = null
      }

      checkpoint += batchSizeInMillis
      if (batch.length) {
        change = batch[batch.length - 1].change
        let copy = batch.slice()
        batch.length = 0
        await processBatch(cleanBatch(copy.map(item => item.value)))
        await delBatch({ log, batch: copy })
        logger.debug(`processed batch of ${copy.length} events`)
      }

    } while (!stopped)
  }

  const promise = run()
  promise.stop = stop
  return promise
}

const delBatch = async ({ log, batch }) => {
  await Promise.map(batch, item => log.del(item.change), {
    concurrency: 10
  })
}

// const toCallback = (resolve, reject) => err => {
//   if (err) return reject(err)

//   resolve()
// }

// const clearDB = async db => new Promise((resolve, reject) => {
//   // it's easier to just delete the directory
//   pump(
//     db.createReadStream(),
//     mapStream((data, cb) => db.del(data.key, cb)),
//     toCallback(resolve, reject),
//   )
// })

const cleanBatch = batch => {
  let [prev, ...rest] = batch
  const pruned = [prev]
  for (const item of rest) {
    if (prev.start && item.end) {
      pruned.pop()
      pruned.push({
        ...omit(item, ['start', 'end']),
        time: prev.time,
        duration: item.time - prev.time
      })
    } else {
      pruned.push(item)
    }

    prev = item
  }

  return pruned
}

module.exports = {
  processLog,
  // clearDB,
}
