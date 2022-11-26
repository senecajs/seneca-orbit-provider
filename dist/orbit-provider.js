"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Pkg = require('../package.json');
let workspace;
function OrbitProvider(options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca
        .message('sys:provider,provider:orbit,get:info', get_info);
    const makeUrl = (suffix, q) => {
        let url = options.url + suffix;
        if (q) {
            if ('string' === typeof q) {
                url += '/' + encodeURIComponent(q);
            }
            else if ('object' === typeof q && 0 < Object.keys(q).length) {
                url += '?' + Object
                    .entries(q)
                    .reduce(((u, kv) => (u.append(kv[0], kv[1]), u)), new URLSearchParams())
                    .toString();
            }
        }
        return url;
    };
    const makeConfig = (config) => seneca.util.deep({
        headers: {
            ...seneca.shared.headers
        }
    }, config);
    const setWorkspace = (newWorkspace) => {
        workspace = newWorkspace;
    };
    const getWorkspace = () => {
        return workspace;
    };
    const getJSON = async (url, config) => {
        let res = await options.fetch(url, config);
        if (200 == res.status) {
            let json = await res.json();
            return json;
        }
        else {
            let err = new Error('OrbitProvider ' + res.status);
            err.orbitResponse = res;
            throw err;
        }
    };
    const postJSON = async (url, config) => {
        config.body = 'string' === typeof config.body ? config.body : JSON.stringify(config.body);
        config.headers['Content-Type'] = config.headers['Content-Type'] ||
            'application/json';
        config.method = config.method || 'POST';
        let res = await options.fetch(url, config);
        if (201 === res.status || 200 === res.status) {
            let json = await res.json();
            return json;
        }
        else {
            let err = new Error('OrbitProvider ' + res.status);
            try {
                err.body = await res.json();
            }
            catch (e) {
                err.body = await res.text();
            }
            err.status = res.status;
            throw err;
        }
    };
    const putJSON = async (url, config) => {
        config.body = 'string' === typeof config.body ? config.body :
            JSON.stringify(config.body);
        config.headers['Content-Type'] = config.headers['Content-Type'] ||
            'application/json';
        config.method = config.method || 'PUT';
        let res = await options.fetch(url, config);
        if (204 <= res.status) {
            return { "Success": true };
        }
        else {
            let err = new Error('OrbitProvider ' + res.status);
            try {
                err.body = await res.json();
            }
            catch (e) {
                err.body = await res.text();
            }
            err.status = res.status;
            throw err;
        }
    };
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'orbit',
            version: Pkg.version,
        };
    }
    entityBuilder(this, {
        provider: {
            name: 'orbit'
        },
        entity: {
            list_member: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members';
                            let json = await getJSON(makeUrl(suffUrl, msg.q), makeConfig());
                            let customers = json.data;
                            let list = customers.map((data) => entize(data));
                            return list;
                        },
                    },
                }
            },
            add_identity_member: {
                cmd: {
                    save: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members/' + msg.q.idMember + '/identities';
                            let body = msg.q.body;
                            let json = await postJSON(makeUrl(suffUrl, msg.q), makeConfig(body));
                            let data = json.data;
                            let list = entize(data);
                            return list;
                        },
                    }
                }
            },
            get_member: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members/' + msg.q.idMember;
                            let json = await getJSON(makeUrl(suffUrl, msg.q), makeConfig());
                            let data = json.data;
                            let list = entize(data);
                            return list;
                        },
                    },
                }
            },
            find_member_by_identify: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members/find';
                            let json = await getJSON(makeUrl(suffUrl, msg.q), makeConfig());
                            let data = json.data;
                            let list = entize(data);
                            return list;
                        },
                    },
                }
            },
            list_member_by_organization: {
                cmd: {
                    list: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/organizations/' + msg.q.idOrganization + '/members';
                            let json = await getJSON(makeUrl(suffUrl, msg.q), makeConfig());
                            let data = json.data;
                            let list = data.map((data) => entize(data));
                            return list;
                        },
                    },
                }
            },
            update_member: {
                cmd: {
                    save: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members/' + msg.q.idMember;
                            let body = msg.q.body;
                            let res = await putJSON(makeUrl(suffUrl, msg.q), makeConfig(body));
                            let list = entize(res);
                            return list;
                        },
                    }
                }
            },
            create_or_update_member: {
                cmd: {
                    save: {
                        action: async function (entize, msg) {
                            let suffUrl = getWorkspace() + '/members';
                            let body = msg.q.body;
                            let json = await postJSON(makeUrl(suffUrl, msg.q), makeConfig(body));
                            let data = json.data;
                            let list = entize(data);
                            return list;
                        },
                    }
                }
            },
        }
    });
    seneca.prepare(async function () {
        let res = await this.post('sys:provider,get:keymap,provider:orbit');
        if (!res.ok) {
            throw this.fail('keymap');
        }
        this.shared.headers = {
            Authorization: 'Bearer ' + res.keymap.key.value
        };
        setWorkspace(res.keymap.workspace.value);
    });
    return {
        exports: {
            makeUrl,
            makeConfig,
            getJSON,
            postJSON,
            putJSON
        }
    };
}
// Default options.
const defaults = {
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
};
Object.assign(OrbitProvider, { defaults });
exports.default = OrbitProvider;
if ('undefined' !== typeof (module)) {
    module.exports = OrbitProvider;
}
//# sourceMappingURL=orbit-provider.js.map