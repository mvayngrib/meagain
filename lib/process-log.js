
const Promise = require('bluebird')
const util = require('util')
const collect = util.promisify(require('stream-collector'))
const omit = require('lodash/omit')
const { wait, roundDownToUnit } = require('./utils')
const getChangeTime = change => change.value.time

const processLog = ({
  log,
  processBatch,
  batchSizeInMillis,
}) => {
  let start = log.start - 1
  if (!(batchSizeInMillis > 0)) {
    throw new Error('expected number "batchSizeInMillis"')
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

    promise.cancel = () => stream.destroy()
    return promise
  }

  const getNextOld = async (afterLogIdx) => {
    const results = await collect(log.createReadStream({ since: afterLogIdx, limit: 1 }))
    return results[0]
  }

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
    await Promise.race([
      wait(endTimestamp - now),
      promiseLive,
    ])

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

      if (batch.length) {
        let copy = cleanBatch(batch.slice())
        batch.length = 0
        await processBatch(copy.map(item => item.value))
        await delBatch({ log, batch: copy })
      }

      checkpoint += batchSizeInMillis
      change++
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
  let pruned = [prev]
  for (const item of rest) {
    const { value } = item
    const prevValue = prev.value
    if (prevValue.start && value.end) {
      pruned.pop()
      pruned.push({
        ...item,
        value: {
          ...omit(value, ['start', 'end']),
          duration: value.time - prevValue.time
        },
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
