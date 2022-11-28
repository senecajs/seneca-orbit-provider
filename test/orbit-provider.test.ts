// jest.useFakeTimers();
// jest.setTimeout(15000)
const Seneca = require('seneca');
const OrbitProvider =  require('../src/orbit-provider');
const OrbitProviderDoc = require('../src/OrbitProvider-doc');

describe('orbit-provider', () => {

  test('info', async () => {
    expect(OrbitProvider).toBeDefined()
    expect(OrbitProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:orbit,get:info'))
      .toMatchObject({
        ok: true,
        name: 'orbit',
      })
  })

  test('get', async () => {
    const seneca = await makeSeneca()
    const get = await seneca.entity("provider/orbit/list_member").list$()
    expect(get.length > 0).toBeTruthy();
  })

  test('post', async () => {
    const seneca = await makeSeneca()
    let body_to_create_member = {
      'body': {
        "identity": {
            "source": "api",
            "username": "foo",
        }
      }
    }
    const create_or_update_member = await seneca.entity("provider/orbit/create_or_update_member").save$({'body': body_to_create_member})

    expect(create_or_update_member['attributes']['source']).toContain('api')
    expect(create_or_update_member['attributes']['slug']).toContain('foo')
  })
})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $ORBIT_API_TOKEN: String,
        $WORKSPACE: String
      }
    })
    .use('provider', {
      provider: {
        orbit: {
          keys: {
            key: { value: '$ORBIT_API_TOKEN' },
            workspace: { value: '$WORKSPACE' },
          }
        }
      }
    })
    .use(OrbitProvider)

  return seneca.ready()
}