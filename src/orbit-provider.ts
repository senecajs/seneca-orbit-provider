/* Copyright © 2022 Seneca Project Contributors, MIT License. */


const Pkg = require('../package.json')

let workspace:string

type OrbitProviderOptions = {
  url: string
  fetch: any
  entity: Record<string, any>
  debug: boolean
}


function OrbitProvider(this: any, options: OrbitProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')

  seneca
    .message('sys:provider,provider:orbit,get:info', get_info)



  const makeUrl = (suffix: string, q: any) => {
    let url = options.url + suffix
    if (q) {
      if ('string' === typeof q) {
        url += '/' + encodeURIComponent(q)
      }
      else if ('object' === typeof q && 0 < Object.keys(q).length) {
        url += '?' + Object
          .entries(q)
          .reduce(((u: any, kv: any) =>
            (u.append(kv[0], kv[1]), u)), new URLSearchParams())
          .toString()

      }
    }
    return url
  }

  const makeConfig = (config?: any) => seneca.util.deep({
    headers: {
      ...seneca.shared.headers
    }
  }, config)


  const setWorkspace = (newWorkspace: string) => {
    workspace = newWorkspace;
  }

  const getWorkspace = () => {
    return workspace;
  }

  const getJSON = async (url: string, config?: any) => {
    let res = await options.fetch(url, config)
    if (200 == res.status) {
      let json: any = await res.json()
      return json
    }
    else {
      let err: any = new Error('OrbitProvider ' + res.status)
      err.orbitResponse = res
      throw err
    }
  }


  const postJSON = async (url: string, config: any) => {
    config.body = 'string' === typeof config.body ? config.body : JSON.stringify(config.body)

    config.headers['Content-Type'] = config.headers['Content-Type'] ||
      'application/json'

    config.method = config.method || 'POST'

    let res = await options.fetch(url, config)

    if (201 === res.status || 200 === res.status ) {
      let json: any = await res.json()
      return json
    }
    else {
      let err: any = new Error('OrbitProvider ' + res.status)
      try {
        err.body = await res.json()
      }
      catch (e: any) {
        err.body = await res.text()
      }
      err.status = res.status
      throw err
    }
  }

  const putJSON = async (url: string, config: any) => {
    config.body = 'string' === typeof config.body ? config.body :
    JSON.stringify(config.body)
   

    config.headers['Content-Type'] = config.headers['Content-Type'] ||
      'application/json'

    config.method = config.method || 'PUT'
    let res = await options.fetch(url, config)

    if (204 <= res.status) {
      return {"Success": true}
    }
    else {
      let err: any = new Error('OrbitProvider ' + res.status)
      try {
        err.body = await res.json()
      }
      catch (e: any) {
        err.body = await res.text()
      }
      err.status = res.status
      throw err
    }
  }


  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'orbit',
      version: Pkg.version,
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'orbit'
    },
    entity: {
      list_member: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members'
              let json: any = await getJSON(makeUrl(suffUrl, msg.q), makeConfig())
              let customers = json.data
              let list = customers.map((data: any) => entize(data))
              return list
            },
          },
        }
      },
      add_identity_member: {
        cmd: {
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members/' + msg.q.idMember + '/identities';
              let body = msg.q.body;
              let json: any = await postJSON(makeUrl(suffUrl, msg.q), makeConfig(body))
              let data = json.data
              let list = entize(data)
              return list
            },
          }
        }
      },
      get_member: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members/' + msg.q.idMember
              let json: any = await getJSON(makeUrl(suffUrl, msg.q), makeConfig())
              let data = json.data
              let list = entize(data)
              return list
            },
          },
        }
      },
      find_member_by_identify: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members/find'
              let json: any = await getJSON(makeUrl(suffUrl, msg.q), makeConfig())
              let data = json.data
              let list = entize(data)
              return list
            },
          },
        }
      },
      list_member_by_organization: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/organizations/' + msg.q.idOrganization + '/members'

              let json: any = await getJSON(makeUrl(suffUrl, msg.q), makeConfig())
              let data = json.data
              let list = data.map((data: any) => entize(data))
              return list
            },
          },
        }
      },
      update_member: {
        cmd: {
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members/' + msg.q.idMember
              let body = msg.q.body;
              let res: any = await putJSON(makeUrl(suffUrl, msg.q), makeConfig(body))
              
              let list = entize(res)
              return list
            },
          }
        }
      },
      create_or_update_member: {
        cmd: {
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let suffUrl = getWorkspace() + '/members'
              let body = msg.q.body;
              let json: any = await postJSON(makeUrl(suffUrl, msg.q), makeConfig(body))
              let data = json.data
              let list = entize(data)
              return list
            },
          }
        }
      },
    }
  })



  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:orbit')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    this.shared.headers = {
      Authorization: 'Bearer ' + res.keymap.key.value
    }

    setWorkspace(res.keymap.workspace.value)

  })


  return {
    exports: {
      makeUrl,
      makeConfig,
      getJSON,
      postJSON,
      putJSON
    }
  }
}


// Default options.
const defaults: OrbitProviderOptions = {
  // NOTE: include trailing /
  url: 'https://app.orbit.love/api/v1/',
  // Use global fetch by default - if exists
  fetch: ('undefined' === typeof fetch ? undefined : fetch),

  entity: {
    order: {
      save: {
        // Default fields
      }
    }
  },

  // TODO: Enable debug logging
  debug: false
}


Object.assign(OrbitProvider, { defaults })

export default OrbitProvider

if ('undefined' !== typeof (module)) {
  module.exports = OrbitProvider
}
