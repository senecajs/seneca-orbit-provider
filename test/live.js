
// IMPORTANT: assumes node-fetch@2
const Seneca = require('seneca')

// global.fetch = Fetch

Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity')
  .use('env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      $ORBIT_API_TOKEN: String,
      $WORKSPACE: String,
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
  .use('../')
  .ready(async function() {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:orbit,get:info'))

    //List members in a workspace
    const list_member = await seneca.entity("provider/orbit/member").list$()
    console.log(list_member)
      // get first user in list_member to next test
    let idMember = list_member[0]['id']
    let source = 'foo'
    let name = list_member[0]['attributes']['slug']
    let body_to_add_identity = {
        'body': {
          "source": source,
          "username": name,
        }
    }
    //Add identity to a member
    const add_identity_member = await seneca.entity("provider/orbit/add_identity_member").save$({'idMember': idMember, 'body': body_to_add_identity})
    console.log('add_identity_member', add_identity_member)

    // Create or update a member
      //mock source
    let body_to_create_member = {
      'body': {
        "identity": {
            "source": "api",
            "username": "foo"
        }
      }
    }
    const create_or_update_member = await seneca.entity("provider/orbit/create_or_update_member").save$({'body': body_to_create_member})
    console.log('create_or_update_member', create_or_update_member)

    //Find a member by an identity
    const find_member_by_identify = await seneca.entity("provider/orbit/find_member_by_identify").list$({'source': source, 'username': name})
    console.log('find_member_by_identify', find_member_by_identify)

    //Get a member
    const get_member = await seneca.entity("provider/orbit/get_member").list$({'idMember': idMember})
    console.log('get_member', get_member)

    //List members in an organization
      // id mocked
    let idOrganization = '4qF2KgZ'
    const list_member_by_organization = await seneca.entity("provider/orbit/list_member_by_organization").list$({'idOrganization': idOrganization})
    console.log('list_member_by_organization', list_member_by_organization)
  
    // Update a member
      // mock body to update member
    let body_to_update_member = {
      'body': {
        "name": "foo",
        "bio": "bar"
      }
    }
    const update_member = await seneca.entity("provider/orbit/update_member").save$({'idMember': idMember, 'body': body_to_update_member})
    console.log('update_member', update_member)
    
    return true;
  })

