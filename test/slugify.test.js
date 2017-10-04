const assert = require('assert')
const { slugify } = require('../lib/index')
const { setSlug } = slugify

describe('Slugify', function () {
  describe('the setSlug function', function () {
    it('adds a slug to the data', function () {
      const rule = {
        source: ['forename', 'surname'],
        dest: 'slug'
      }
      const data = {
        forename: 'Marshall',
        surname: 'Thompson'
      }
      setSlug(data, rule)
      assert(data.slug === 'marshall-thompson')
    })

    it('works with nested sources', function () {
      const rule = {
        source: ['address.street', 'address.street2'],
        dest: 'slug'
      }
      const data = {
        address: {
          street: 'Some Place',
          street2: 'Safe'
        }
      }
      setSlug(data, rule)
      assert(data.slug === 'some-place-safe')
    })

    it('works when sources is just a string', function () {
      const rule = {
        source: 'address',
        dest: 'slug'
      }
      const data = {
        address: `I'm so happy`
      }
      setSlug(data, rule)
      assert(data.slug === 'i-m-so-happy')
    })

    it('sets dest by dot', function () {
      const rule = {
        source: ['name.first', 'name.last'],
        dest: 'name.full'
      }
      const data = {
        name: {
          first: 'Matt',
          last: 'Chaffe'
        }
      }
      setSlug(data, rule)
      assert(data.name.full === 'matt-chaffe')
    })

    it('does not overwrite by default', function () {
      const rule = {
        source: ['name.first', 'name.last'],
        dest: 'name.full'
      }
      const data = {
        name: {
          first: 'Matt',
          last: 'Chaffe',
          full: 'Matt-Chaffe'
        }
      }
      setSlug(data, rule)
      assert(data.name.full === 'Matt-Chaffe')
    })

    it('overwrites when specified', function () {
      const rule = {
        source: ['name.first', 'name.last'],
        dest: 'name.full',
        overwrite: true
      }
      const data = {
        name: {
          first: 'Matt',
          last: 'Chaffe',
          full: 'Matt-Chaffe'
        }
      }
      setSlug(data, rule)
      assert(data.name.full === 'matt-chaffe')
    })

    it('throws an error when missing source', function () {
      const rule = {
        dest: 'name.full',
        overwrite: true
      }
      const data = {
        name: {
          first: 'Matt',
          last: 'Chaffe',
          full: 'Matt-Chaffe'
        }
      }
      try {
        setSlug(data, rule)
      } catch (error) {
        assert(error.message === 'setSlug: each slugify rule must have a `source` property')
      }
    })

    it('throws an error when missing source', function () {
      const rule = {
        source: [],
        overwrite: true
      }
      const data = {
        name: {
          first: 'Matt',
          last: 'Chaffe',
          full: 'Matt-Chaffe'
        }
      }
      try {
        setSlug(data, rule)
      } catch (error) {
        assert(error.message === 'setSlug: each slugify rule must have a `dest` property')
      }
    })
  })

  describe('the slugify hook', function () {
    it('works with a ruleConfig', function () {
      const ruleConfig = {
        fullname: ['name.first', 'name.last']
      }
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          }
        }
      }
      slugify(ruleConfig)(hook)
      assert(hook.data.fullname === 'marshall-thompson')
    })

    it('works with a ruleConfig and array of data', function () {
      const ruleConfig = {
        fullname: ['name.first', 'name.last']
      }
      const hook = {
        method: 'create',
        type: 'before',
        data: [
          {
            name: {
              first: 'Marshall',
              last: 'Thompson'
            }
          },
          {
            name: {
              first: 'Matt',
              last: 'Chaffe'
            }
          }
        ]
      }
      slugify(ruleConfig)(hook)
      assert(hook.data[0].fullname === 'marshall-thompson')
      assert(hook.data[1].fullname === 'matt-chaffe')
    })

    it('works with an array of rules', function () {
      const rules = [{
        source: ['name.first', 'name.last'],
        dest: 'fullname'
      }]
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          }
        }
      }
      slugify(rules)(hook)
      assert(hook.data.fullname === 'marshall-thompson')
    })

    it('works with an array of rules with mixed sources', function () {
      const rules = [
        {
          source: ['name.first', 'name.last'],
          dest: 'fullname'
        },
        {
          source: 'name.first',
          dest: 'firstname'
        }
      ]
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          }
        }
      }
      slugify(rules)(hook)
      assert(hook.data.fullname === 'marshall-thompson')
      assert(hook.data.firstname === 'marshall')
    })

    it('works with an ruleConfig and source as string', function () {
      const rule = {
        'name.firstname': 'name.first'
      }
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          }
        }
      }
      slugify(rule)(hook)
      assert(hook.data.name.firstname === 'marshall')
    })

    it('works with an array of data and rules', function () {
      const rules = [{
        source: ['name.first', 'name.last'],
        dest: 'fullname'
      }]
      const hook = {
        method: 'create',
        type: 'before',
        data: [
          {
            name: {
              first: 'Marshall',
              last: 'Thompson'
            }
          },
          {
            name: {
              first: 'Matt',
              last: 'Chaffe'
            }
          }
        ]
      }
      slugify(rules)(hook)
      assert(hook.data[0].fullname === 'marshall-thompson')
      assert(hook.data[1].fullname === 'matt-chaffe')
    })

    it('does not overwrite with a ruleConfig by default', function () {
      const ruleConfig = {
        fullname: ['name.first', 'name.last']
      }
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          },
          fullname: 'blah'
        }
      }
      slugify(ruleConfig)(hook)
      assert(hook.data.fullname === 'blah')
    })

    it('allows overwrite with a ruleConfig', function () {
      const ruleConfig = {
        fullname: ['name.first', 'name.last']
      }
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          },
          fullname: 'blah'
        }
      }
      slugify(ruleConfig, { overwrite: true })(hook)
      assert(hook.data.fullname === 'marshall-thompson')
    })

    it('allows overwrite with rules', function () {
      const rules = [{
        source: ['name.first', 'name.last'],
        dest: 'fullname',
        overwrite: true
      }]
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson'
          },
          fullname: 'blah'
        }
      }
      slugify(rules)(hook)
      assert(hook.data.fullname === 'marshall-thompson')
    })

    it('allows overwrite for individual rules', function () {
      const rules = [
        {
          source: ['name.first', 'name.last'],
          dest: 'fullname'
        },
        {
          source: ['name.first', 'name.last'],
          dest: 'name.fullname',
          overwrite: true
        }
      ]
      const hook = {
        method: 'create',
        type: 'before',
        data: {
          name: {
            first: 'Marshall',
            last: 'Thompson',
            fullname: 'My Name'
          },
          fullname: 'blah'
        }
      }
      slugify(rules)(hook)
      assert(hook.data.fullname === 'blah')
      assert(hook.data.name.fullname === 'marshall-thompson')
    })
  })
})
