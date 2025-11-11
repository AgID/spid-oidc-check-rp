const fs = require('fs');
const UUID = require("uuidjs");
const sqlite3 = require('better-sqlite3');
const moment = require('moment');
const utility = require('./utils.js');
const config_test = require("../../config/test.json");
const dbfile = "data/database.sqlite";

 
class Database {

    constructor() {

    }

    connect() {
        this.db = new sqlite3(dbfile, { verbose: (text)=> {
            utility.log("DATABASE : QUERY", (text.replaceAll('\\s+', ' ')));
        }});
        return this;
    }

    close() {
        if(!this.db) { utility.log("DATABASE", "Error: DB null."); return -1; }
        this.db.close();
    }

    checkdb() {
        let me = this;
        let exists = fs.existsSync(dbfile);
        if(!me || !me.db || !exists) {
            me = this.connect().setup();
        }

        if(!me.db) { utility.log("DATABASE", "Error: DB null."); return false; }            
        return me;
    }

    setup() {
        if(!this.checkdb()) return;

        try { 
            this.db.exec(" \
                CREATE TABLE IF NOT EXISTS log ( \
                    timestamp   DATETIME DEFAULT (datetime('now', 'localtime')) NOT NULL, \
                    type        STRING,   \
                    text        STRING (1024) \
                ); \
                CREATE TABLE IF NOT EXISTS store ( \
                    user                        STRING UNIQUE, \
                    organization                INTEGER, \
                    client_id                   STRING, \
                    external_code               STRING UNIQUE, \
                    timestamp                   DATETIME, \
                    type                        STRING, \
                    store                       TEXT, \
                    PRIMARY KEY (user, type)     \
                ); \
                CREATE TABLE IF NOT EXISTS token ( \
                    req_id          INTEGER PRIMARY KEY AUTOINCREMENT, \
                    req_timestamp   DATETIME DEFAULT (datetime('now')) NOT NULL, \
                    user            STRING, \
                    store_type      STRING, \
                    testsuite       STRING, \
                    testcase        STRING, \
                    client_id       STRING, \
                    redirect_uri    STRING, \
                    code            STRING UNIQUE, \
                    auth_timestamp  DATETIME DEFAULT (datetime('now')) NOT NULL, \
                    authrequest     TEXT, \
                    authresponse    TEXT, \
                    tokenrequest    TEXT, \
                    tokenresponse   TEXT, \
                    userinforequest TEXT, \
                    userinforesponse TEXT, \
                    id_token        STRING UNIQUE, \
                    access_token    STRING UNIQUE, \
                    token_timestamp DATETIME, \
                    userinfo        STRING, \
                    state           STRING, \
                    nonce           STRING \
                ); \
                CREATE TABLE IF NOT EXISTS grant_token (\
                    kid             STRING UNIQUE, \
                    token_timestamp DATETIME DEFAULT (datetime('now')) NOT NULL, \
                    token           STRING, \
                    payload         TEXT, \
                    scope           STRING, \
                    exp             STRING, \
                    sub             STRING, \
                    client_id       STRING, \
                    iss             STRING, \
                    aud             STRING \
                ); \
            ");

            this.db.exec(" \
                DELETE FROM token WHERE req_timestamp <= datetime('now', '-30 minutes'); \
                DELETE FROM grant_token WHERE token_timestamp <= datetime('now', '-60 minutes'); \
                DELETE FROM log WHERE timestamp <= datetime('now', '-60 minutes'); \
            ");

        } catch(exception) {
            console.log("DATABASE already exists. Skip database creation.", exception);
        }
        return this;
    }

    select(sql) {
        if(!this.checkdb()) return;
        
        let result = [];
        try { 
            result = this.db.prepare(sql).all();
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (select)", exception.toString());
        }
        return result;
    }

    log(tag, text) {
        if(!this.checkdb()) return;

        let sql = "INSERT INTO log(timestamp, type, text) VALUES (DATETIME('now', 'localtime'), ?, ?)";
        try { 
            result = this.db.prepare(sql).run(tag, text);
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (log)", exception.toString());;
        }
    }


    saveStore(user, organization, client_id, external_code, store_type, new_store) {
        if(!this.checkdb()) return;

        let sql1 = " \
            INSERT OR IGNORE INTO store(user, organization, client_id, external_code, timestamp, type, store) \
            VALUES (?, ?, ?, ?, DATETIME('now', 'localtime'), ?, ?);";
        let sql2 = "UPDATE store SET timestamp=DATETIME('now', 'localtime'), ";

        try { 
            let store = this.getStore(user, store_type);
            if(!store) store = {};

            for(let key in new_store) {
                store[key] = new_store[key];
            }

            let storeSerialized = JSON.stringify(store);

            let sql2_values = [];
            if(external_code!=null && external_code!='') {
                sql2 += "external_code=?, ";
                sql2_values.push(external_code);
            }
            if(organization!=null && organization!='') {
                sql2 += "organization=?, ";
                sql2_values.push(organization);
            } 
            if(client_id!=null && client_id!='') {
                sql2 += "client_id=?, ";
                sql2_values.push(client_id);
            } 
            sql2 += "store=? WHERE user=? AND type=?";
            sql2_values.push(storeSerialized);
            sql2_values.push(user);
            sql2_values.push(store_type);
           
            this.db.prepare(sql1).run(user, organization, client_id, external_code, store_type, storeSerialized);
            this.db.prepare(sql2).run(...sql2_values);

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (saveStore)", exception.toString());
            throw(exception);
        } 
    }

    getOrganization(user, store_type) {
        if(!this.checkdb()) return;

        try {
            let data = false;
            let sql = this.db.prepare("SELECT organization FROM store WHERE user=? AND type=?");
            let result = sql.all(user, store_type);
            if(result.length==1) data = result[0].organization;
            return data; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getOrganization)", exception.toString());
            throw(exception);
        }
    }

    getStore(user, store_type) {
        if(!this.checkdb()) return;

        try {
            let sql_query = "SELECT store, type FROM store WHERE user=? ";

            let multiple_store_type = store_type.indexOf(',')!=-1;
            let store_type_value;
            if(multiple_store_type) {
                store_type = store_type.replaceAll(' ', '');
                let store_types = store_type.split(',');
                sql_query += " AND type IN('" + store_types.join("', '") + "')";

            } else {
                sql_query += " AND type='" + store_type + "'";
            }

            let sql = this.db.prepare(sql_query);
            let result = sql.all(user);
            
            let data = null;

            if(multiple_store_type) {
                if(result.length>0) {
                    data = [];
                    for(let row in result) {
                        let store = JSON.parse(result[row].store);
                        store.store_type = result[row].type;
                        data.push(store);
                    }
                }

            } else {
                if(result.length==1) {
                    data = JSON.parse(result[0].store);
                }
            }

            return data;

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getStore)", exception.toString());
            throw(exception);
        }
    }

    setMetadata(user, external_code, store_type, metadata) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);
        if(!store) store = {};
        store.metadata = metadata;

        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        //if(!store.metadata.configuration.op_name) throw new Error("op_name configuration is not found");
        if(!store.metadata.configuration.client_id) throw new Error("client_id configuration is not found");

        let organization = null; //metadata.configuration.op_name;
        let client_id = metadata.configuration.client_id;
    
        this.saveStore(user, organization, client_id, external_code, store_type, store);
    }

    getMetadata(user, store_type) {
        if(!this.checkdb()) return;
        
        try {
            let metadata = false;
            let store = this.getStore(user, store_type);
            if(store) {
                metadata = store.metadata;
            }
            return metadata; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getMetadata)", exception.toString());
            throw(exception);
        }
    }

    setTest(user, external_code, store_type, testsuite, testcase, hook, test) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);

        if(!store) throw new Error("Store is not found");
        if(!store.metadata) throw new Error("Metadata is not found");
        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        //if(!store.metadata.configuration.op_name) throw new Error("op_name configuration is not found");
        if(!store.metadata.configuration.client_id) throw new Error("client_id configuration is not found");

        if(!store.test) store.test = {};
        if(!store.test[testsuite]) {
            store.test[testsuite] = {
                description: config_test[testsuite].description,
                cases: {}
            };   
        }
  
        if(!store.test[testsuite]['cases'][testcase]) {
            store.test[testsuite]['cases'][testcase] = {};
        }

        if(!store.test[testsuite]['cases'][testcase]['hook']) {
            store.test[testsuite]['cases'][testcase]['hook'] = {};
        }

        if(!store.test[testsuite]['cases'][testcase]['hook'][hook]) {
            store.test[testsuite]['cases'][testcase]['hook'][hook] = {};
        }

        let store_hook = store.test[testsuite]['cases'][testcase]['hook'];

        // always update on the last check
        store.test[testsuite]['cases'][testcase] = {
            name: config_test[testsuite]['cases'][testcase].name,
            description: config_test[testsuite]['cases'][testcase].description,
            ref: config_test[testsuite]['cases'][testcase].ref,
            datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
            hook: store_hook
        };
        
        store.test[testsuite]['cases'][testcase]['hook'][hook][test.num] = test;

        let organization = null; //store.metadata.configuration.op_name;
        let client_id = store.metadata.configuration.client_id;
    
        this.saveStore(user, organization, client_id, external_code, store_type, store);
    }

    setLastLog(user, external_code, store_type, testsuite, log, append=false) {
        if(!this.checkdb()) return;

        let store = this.getStore(user, store_type);

        if(!store) throw new Error("Store is not found");
        if(!store.metadata) throw new Error("Metadata is not found");
        if(!store.metadata.configuration) throw new Error("Metadata Configuration is not found");
        //if(!store.metadata.configuration.op_name) throw new Error("op_name configuration is not found");
        if(!store.metadata.configuration.client_id) throw new Error("client_id configuration is not found");

        let organization = null; //store.metadata.configuration.op_name;
        let client_id = store.metadata.configuration.client_id;

        if(append) {
            log = {
                ...store.test[testsuite]['lastlog'],
                ...log        
            }
        }

        store.test[testsuite]['lastlog'] = log;
        this.saveStore(user, organization, client_id, external_code, store_type, store);
    }

    getReport(user, store_type, testsuite) {
        if(!this.checkdb()) return;
        
        try {
            let report = {};
            let store = this.getStore(user, store_type);
            if(store) {
                report = store.test[testsuite];
            }
            return report; 

        } catch(exception) {
            utility.log("DATABASE EXCEPTION (getReport)", exception.toString());
            throw(exception);
        }
    }

    deleteStore(user, store_type) {
        if(!this.checkdb()) return;

        let sql = "DELETE FROM store WHERE user=? AND type=?";

        try { 
            this.db.prepare(sql).run(user, store_type);
        } catch(exception) {
            utility.log("DATABASE EXCEPTION (deleteStore)", exception.toString());
            throw(exception);
        } 
    }




    /* --------- OIDC Authorization Code Flow Helper ------------------- */

    saveRequest(user, store_type, testsuite, testcase, authrequest) {
        let code = authrequest.code || UUID.generate();
        let stmt = this.db.prepare(" \
            INSERT INTO token(user, store_type, testsuite, testcase, \
                client_id, redirect_uri, code, authrequest) \
            VALUES(:user, :store_type, :testsuite, :testcase, \
                :client_id, :redirect_uri, :code, :authrequest); \
        ");
        let info = stmt.run({
            'user': user,
            'store_type': store_type,
            'testsuite': testsuite,
            'testcase': testcase,
            'client_id': authrequest.client_id,
            'redirect_uri': authrequest.redirect_uri,
            'code': code,
            'state': authrequest.state,
            'nonce': authrequest.nonce,
            'authrequest': JSON.stringify(authrequest)
        });
        //let req_id = info.lastInsertRowid;

        return code;
    }

    updateRequest(client_id, redirect_uri, state='', nonce='') {
        let req_id = null;
        let stmt = this.db.prepare(" \
            SELECT req_id FROM token \
            WHERE client_id=:client_id \
            AND redirect_uri=:redirect_uri \
            AND req_timestamp > datetime('now', '-30 minutes') \
            ORDER BY req_timestamp DESC \
            LIMIT 1; \
        ");
        let result = stmt.all({
            'client_id': client_id,
            'redirect_uri': redirect_uri
        });

        if(result.length==1) {
            req_id = result[0]['req_id'];
            stmt = this.db.prepare(" \
                UPDATE token \
                SET state=:state, nonce=:nonce \
                WHERE req_id=:req_id; \
            ");
            stmt.run({
                'state': state,
                'nonce': nonce,
                'req_id': req_id
            });
        }
        return req_id;
    }

    getRequestByCode(code) {
        let stmt = this.db.prepare(" \
            SELECT * FROM token \
            WHERE code = :code;"
        );

        let result = stmt.all({
            'code': code
        });

        let request = null;
        if(result.length==1) {
            request = {
                req_id: result[0]['req_id'], 
                user: result[0]['user'],
                store_type: result[0]['store_type'],
                testsuite: result[0]['testsuite'],
                testcase: result[0]['testcase'],
                client_id: result[0]['client_id'],
                redirect_uri: result[0]['redirect_uri'],
                state: result[0]['state'],
                nonce: result[0]['nonce'],
                authrequest: JSON.parse(result[0]['authrequest'])
            };
        }

        return request;
    }

    getRequestByIdToken(id_token) {
        let stmt = this.db.prepare(" \
            SELECT * FROM token \
            WHERE id_token = :id_token;"
        );

        let result = stmt.all({
            'id_token': id_token
        });

        let request = null;
        if(result.length==1) {
            request = {
                req_id: result[0]['req_id'], 
                user: result[0]['user'],
                store_type: result[0]['store_type'],
                testsuite: result[0]['testsuite'],
                testcase: result[0]['testcase'],
                client_id: result[0]['client_id'],
                redirect_uri: result[0]['redirect_uri'],
                state: result[0]['state'],
                nonce: result[0]['nonce'],
                authrequest: JSON.parse(result[0]['authrequest'])
            };
        }

        return request;
    }

    getRequestByAccessToken(access_token) {
        let stmt = this.db.prepare(" \
            SELECT * FROM token \
            WHERE access_token = :access_token;"
        );

        let result = stmt.all({
            'access_token': access_token
        });
 
        let request = null;
        if(result.length==1) {
            request = {
                req_id: result[0]['req_id'], 
                user: result[0]['user'],
                store_type: result[0]['store_type'],
                testsuite: result[0]['testsuite'],
                testcase: result[0]['testcase'],
                client_id: result[0]['client_id'],
                redirect_uri: result[0]['redirect_uri'],
                state: result[0]['state'],
                nonce: result[0]['nonce'],
                authrequest: JSON.parse(result[0]['authrequest'])
            };
        }

        return request;
    }

    getRequestByClientID(client_id) {
        let stms = this.db.prepare(" \
            SELECT req_id, client_id, redirect_uri, state, nonce FROM token \
            WHERE client_id = :client_id \
            ORDER BY auth_timestamp DESC;"
        );

        let result = stmt.all({
            'client_id': client_id
        });

        return result;
    }

    createAuthorizationCode(req_id) {
        let code = UUID.generate();

        let stmt = this.db.prepare(" \
            UPDATE token \
            SET code=:code, auth_timestamp=datetime('now') \
            WHERE req_id=:req_id; \
        ");

        let result = stmt.run({
            'code':     code,
            'req_id':   req_id
        });

        return code;
    }

    checkAuthorizationCode(client_id, redirect_uri, code) {
        let check = false;

        let stmt = this.db.prepare(" \
            SELECT req_id FROM token \
            WHERE client_id=:client_id \
            AND redirect_uri=:redirect_uri \
            AND code=:code; \
        ");

        let result = stmt.all({
            'client_id':    client_id,
            'redirect_uri': redirect_uri,
            'code':         code
        });

        if(result.length==1) check = true;

        return check;
    }

    saveIdToken(req_id, id_token) {
        let stmt = this.db.prepare(
            "UPDATE token SET id_token=:id_token WHERE req_id=:req_id"
        );

        let result = stmt.run({
            'id_token': id_token,
            'req_id':   req_id
        });
    }

    checkIdToken(id_token) {
        let check = false;

        let stmt = this.db.prepare(" \
            SELECT req_id FROM token \
            WHERE id_token=:id_token; \
        ");

        let result = stmt.all({
            'id_token': id_token
        })

        if(result.length==1) check = true;

        return check;
    }

    createAccessToken(code) {
        let access_token = UUID.generate();

        let stmt = this.db.prepare(" \
            UPDATE token \
            SET access_token=:access_token, token_timestamp=datetime('now') \
            WHERE code=:code; \
        ");

        let result = stmt.run({
            'access_token': access_token,
            'code':         code
        });

        return access_token;
    }
    
    saveAccessToken(req_id, access_token) {
        let stmt = this.db.prepare(" \
            UPDATE token \
            SET access_token=:access_token \
            WHERE req_id=:req_id \
        ");
        
        let result = stmt.run({
            'access_token': access_token,
            'req_id':       req_id
        });
    }

    checkAccessToken(access_token) {
        let check = false;

        let stmt = this.db.prepare(" \
            SELECT req_id FROM token \
            WHERE access_token=:access_token; \
        ");

        let result = stmt.all({
            'access_token': access_token
        })

        if(result.length==1) check = true;

        return check;
    }

    saveUserinfo(req_id, userinfo) {
        let stmt = this.db.prepare(" \
            UPDATE token \
            SET userinfo=:userinfo \
            WHERE req_id=:req_id \
        ");
        
        let result = stmt.run({
            'userinfo': JSON.stringify(userinfo),
            'req_id':   req_id
        });
    }

    getUserinfo(access_token) {
        let stmt = this.db.prepare(" \
            SELECT userinfo \
            FROM token \
            WHERE access_token=:access_token \
        ");
        
        let result = stmt.all({
            'access_token': access_token
        });

        return JSON.parse(result[0]['userinfo']);
    }

    deleteRequest(req_id) {
        let stmt = this.db.prepare(" \
            DELETE FROM token \
            WHERE req_id=:req_id \
        ");
        
        let result = stmt.run({
            'req_id': req_id
        });
    }


    setStep(req_id, step, value) {
        let steps = [
            'authrequest', 
            'authresponse',
            'tokenrequest',
            'tokenresponse',
            'userinforequest',
            'userinforesponse',
            'introspectionrequest',
            'introspectionresponse'
        ];

        if(steps.includes(step)) {
            let stmt = this.db.prepare(" \
                UPDATE token \
                SET " + step + "=:step \
                WHERE req_id=:req_id \
            ");
            
            let result = stmt.run({
                'step': JSON.stringify(value),
                'req_id': req_id
            });
        }
    }

    getStepValue(req_id, step) {
        let stmt = this.db.prepare(" \
            SELECT " + step + " \
            FROM token \
            WHERE req_id=:req_id \
        ");
        
        let result = stmt.all({
            'req_id': req_id
        });

        return JSON.parse(result[0][step]);
    }

    saveGrantToken(kid, token, payload, scope=null, exp=null, sub=null, client_id=null, iss=null, aud=null) {
        let stmt = this.db.prepare(" \
            INSERT INTO grant_token(kid, token, payload, scope, exp, sub, client_id, iss, aud) \
            VALUES(:kid, :token, :payload, :scope, :exp, :sub, :client_id, :iss, :aud); \
        ");
        stmt.run({
            'kid': kid,
            'token': token,
            'payload': payload,
            'scope':scope,
            'exp':exp,
            'sub':sub,
            'client_id':client_id,
            'iss':iss,
            'aud':aud
        });
    }

    checkGrantToken(grant_token) {
        let check = false;

        let stmt = this.db.prepare(" \
            SELECT * FROM grant_token \
            WHERE token=:grant_token; \
        ");

        let result = stmt.all({
            'grant_token': grant_token
        })

        if(result.length==1) {
            let saved = result[0];
            saved['payload'] = JSON.parse(saved['payload']);
            console.log("Grant Token", saved); 
            if(moment.unix(saved['exp']).isAfter(moment())) check = saved;
        }

        return check;
    }    
}
    
module.exports = Database; 
