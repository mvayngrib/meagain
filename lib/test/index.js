const test = require('tape')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')
const { fromDB, DB_OPTS } = require('../log')
const { processLog } = require('../process-log')

test('log processor', async (t) => {
  const log = fromDB(levelup(encode(memdown('test-log.db')), DB_OPTS))
  const start = Date.now() - 1000

  // 2 hrs of events
  let i
  for (i = 0; i < 20; i++) {
    await log.append({
      _end: start + i * 100,
      index: i
    })
  }

  let idx = -1
  const eventLoopKludge = setInterval(() => {})
  const processor = processLog({
    log,
    batchSizeInMillis: 1000,
    processBatch: async (batch) => {
      // console.log('batch length', batch.length)
      t.equal(batch.length, 10)

      for (const item of batch) {
        if (++idx !== item.index) {
          throw new Error('out of order!')
        }
      }

      if (idx === i - 1) {
        processor.stop()
      }
    }
  })

  await processor
  clearInterval(eventLoopKludge)
  t.equal(idx, i - 1)
  t.end()
})
