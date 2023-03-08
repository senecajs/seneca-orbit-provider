![Seneca Orbit-Provider](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Orbit-Provider_ is a plugin for [Seneca](http://senecajs.org)


Provides access to the Orbit API using the Seneca *provider*
convention. Orbit API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.

See [seneca-entity](senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

NOTE: underlying third party SDK needs to be replaced as out of date and has a security issue.

[![npm version](https://img.shields.io/npm/v/@seneca/orbit-provider.svg)](https://npmjs.com/package/@seneca/orbit-provider)
[![build](https://github.com/senecajs/seneca-orbit-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-orbit-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-orbit-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-orbit-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-orbit-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-orbit-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-orbit-provider/maintainability)


| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|


## Quick Example


```js

// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
Seneca()
  // Get API keys using the seneca-env plugin
  .use('env', {
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
  .use('orbit-provider')

let listMember = await seneca.entity('provider/orbit/member')
  .list$()
Console.log(listMember)

let loadMember = await seneca.entity('provider/orbit/member')
  .load$('<member-id>')
Console.log(loadMember)

let body_to_update_member = {
  'body': {
    "name": "foo",
    "bio": "bar"
  }
}

let saveMember = await seneca.entity('provider/orbit/member')
  .save$({
    'idMember': '<member-id>',
    'body': body_to_update_member
  })
Console.log(saveMember)


let addIndentifyMember = await seneca.entity("provider/orbit/identify_member")
  .save$({
    'idMember': idMember, 
    'body': body_to_add_identity
  })
Console.log(addIndentifyMember)

let identifyMember = await seneca.entity("provider/orbit/identify_member")
  .list$({
    'source': 'foo',
    'username': 'bar'
  })
Console.log(identifyMember)


let list_member_by_organization = await seneca.entity("provider/orbit/list_member_by_organization").list$({'idOrganization': idOrganization})
Console.log(list_member_by_organization)

let body_to_create_member = {
  'body': {
    "identity": {
        "source": "api",
        "username": "foo"
    }
  }
}
const create_or_update_member = await seneca.entity("provider/orbit/create_member").save$({'body': body_to_create_member})
console.log(create_or_update_member)
```

## Install

```sh
$ npm install @seneca/orbit-provider @seneca/env
```



<!--START:options-->


## Options

* `debug` : boolean <i><small>false</small></i>


Set plugin options when loading with:
```js


seneca.use('OrbitProvider', { name: value, ... })


```


<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 



<!--END:options-->

<!--START:action-list-->


## Action Patterns

* [role:entity,base:orbit,cmd:load,name:repo,zone:provider](#-roleentitybaseorbitcmdloadnamerepozoneprovider-)
* [role:entity,base:orbit,cmd:save,name:repo,zone:provider](#-roleentitybaseorbitcmdsavenamerepozoneprovider-)
* [sys:provider,get:info,provider:orbit](#-sysprovidergetinfoproviderorbit-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `role:entity,base:orbit,cmd:load,name:repo,zone:provider` &raquo;

Load Orbit repository data into an entity.



----------
### &laquo; `role:entity,base:orbit,cmd:save,name:repo,zone:provider` &raquo;

Update Orbit repository data from an entity.



----------
### &laquo; `sys:provider,get:info,provider:orbit` &raquo;

Get information about the provider.



----------


<!--END:action-desc-->
