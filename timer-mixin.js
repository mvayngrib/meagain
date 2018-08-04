
const proxies = [
  {
    type: 'timeout',
    setMethod: 'setTimeout',
    clearMethod: 'clearTimeout',
    set: setTimeout,
    clear: clearTimeout,
  },
  {
    type: 'interval',
    setMethod: 'setInterval',
    clearMethod: 'clearInterval',
    set: setInterval,
    clear: clearInterval,
  }
]

exports.create = () => {
  const cache = {}
  const mixin = proxies.reduce((all, one) => {
    const { type, setMethod, clearMethod, set, clear } = one
    cache[type] = []
    all[setMethod] = (...args) => {
      const ref = set(...args)
      cache[type].push({ args, ref })
      const [fn, /* delay*/, ...params] = args
      setImmediate(fn, ...params)
      return ref
    }

    all[clearMethod] = (ref) => {
      cache[type] = cache[type].filter(item => item.ref !== ref)
    }

    all[`${clearMethod}s`] = () => {
      cache[type].slice().forEach(item => clear(item.ref))
    }

    return all
  }, {})

  mixin.clearTimers = () => {
    proxies.forEach(({ clearMethod }) => mixin[`${clearMethod}s`]())
  }

  return mixin
}

exports.mixin = obj => Object.assign(obj, exports.create())
