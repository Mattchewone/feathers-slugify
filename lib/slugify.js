const Debug = require('debug')
const debug = Debug('feathers-slugify')
const slugify = require('url-slug')
const assert = require('nanoassert')
const { checkContext, existsByDot, getByDot, setByDot } = require('feathers-hooks-common')

const defaults = { overwrite: false }

/**
 * Slugify hook, will slugify a property(s)
 * const rules = {
 *   slug: ['forename', 'surname'],
 *   'other.slug': 'url'
 * }
 * const options = { overwrite: false }
 */
module.exports = (ruleConfig, options = {}) => {
  const { overwrite } = Object.assign(defaults, options)

  let rules
  if (Array.isArray(ruleConfig)) {
    ruleConfig.forEach(rule => {
      assert(rule.hasOwnProperty('source'), 'slugify hook: `source` is required in each rule')
      assert(rule.hasOwnProperty('dest'), 'slugify hook: `dest` is required in each rule')
    })
    rules = ruleConfig
  } else {
    rules = Object.keys(ruleConfig).map(dest => {
      let source = ruleConfig[dest]
      // Normalize src into an array
      source = Array.isArray(source) ? source : [source]
      return { source, dest, overwrite }
    })
  }

  return function slugifyHook (hook) {
    // Check that it is ran as before create only
    checkContext(hook, 'before', ['create', 'update', 'patch'], 'slugify')

    function setSlugs (data) {
      rules.forEach(rule => {
        setSlug(data, rule)
      })
    }

    if (Array.isArray(hook.data)) {
      // Process if there is an array of data
      hook.data.forEach(setSlugs)
    } else {
      // Process singular data
      setSlugs(hook.data)
    }
  }
}

function setSlug (data, { source, dest, overwrite = false }) {
  assert(source, 'setSlug: each slugify rule must have a `source` property')
  assert(dest, 'setSlug: each slugify rule must have a `dest` property')

  const exists = existsByDot(data, dest)

  source = Array.isArray(source) ? source : [source]
  // Check we have not been passed a slug, dont want to overwrite that
  if ((exists && overwrite) || !exists) {
    // Gather the values of each source into an array
    const sourceValues = source.reduce((acc, src) => {
      const sourceValue = getByDot(data, src)
      acc.push(sourceValue)
      return acc
    }, [])
    const slugSource = sourceValues.join(' ')

    let slug = slugify(slugSource).toLowerCase()

    debug(`slugSource: ${slugSource}, slug: ${slug}`)

    // Add the sligified text to the slug field
    setByDot(data, dest, slug)
    return data
  }
}

module.exports.setSlug = setSlug
