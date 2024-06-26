const fs = require("fs");
const path = require("path");
const x509 = require("@peculiar/x509");
const jose = require('node-jose');
const moment = require('moment');
const base64url = require('base64url');
const jwt_decode = require("jwt-decode");
const Utility = require("../lib/utils");
const config_server = require("../../config/server.json");
const config_op = require("../../config/op.json");
const config_dir = require("../../config/dir.json");
const config_test = require("../../config/test.json");


module.exports = function(app, checkAuthorisation, database) {

    // get metadata (OIDC CORE)
    app.get("/.well-known/openid-configuration", async function (req, res) {
        let metadata = await makeMetadata();
        res.status(200).json(metadata);
    }); 

    // get entity configuration (OIDC FEDERATION)
    app.get("/.well-known/openid-federation", async function (req, res) {
        let entity_statement = await makeEntityStatement();

        //set method add charset into content-type
        //res.set('Content-Type', 'application/entity-statement+jwt');
        //res.status(200).send(entity_statement);

        res.writeHead(200, { 'Content-Type': 'application/entity-statement+jwt' });
        res.write(entity_statement);
        res.end();
    });

    // get certs
    app.get("/certs", async function (req, res) {
        let jwks = await makeJWKS();
        res.status(200).json(jwks);
    }); 

    // OIDC Authorization Endpoint
    app.all("/authorization", async function(req, res) { 
        let params = (req.method=='POST')? req.body : (req.method=='GET')? req.query : null;
        console.log("Authorization Request", req.body);     
        
        req.session.authrequest = {
            method: req.method,
            mimetype: req.get('Content-Type'),
            ...params,
            request_payload: params.request? jwt_decode(params.request) : undefined
        };

        res.redirect(config_server.host);
    });

    // OIDC Token Endpoint
    app.all("/token", async function(req, res) { 

        let tokenrequest = {
            method: req.method,
            mimetype: req.get('Content-Type'),
            ...req.body
        }

        console.log("Token Request", tokenrequest);     

        let code = tokenrequest.code;
        if(!code) res.status(400).json({
            error: 'invalid_grant',
            description: 'code not valid'
        });

        let external_code = null;
        let request = database.getRequestByCode(code);
        let user = request.user;
        let store_type = request.store_type;
        let testsuite = request.testsuite;
        let testcase = request.testcase;
        let authrequest = request.authrequest;
        let authresponse = {};
        let metadata = database.getMetadata(user, store_type);
        let report = [];

        { // token-request
            let hook = "token-request";

            database.setStep(request.req_id, 'tokenrequest', tokenrequest);
            database.setLastLog(user, external_code, store_type, testsuite, {
                details: {
                    metadata: metadata,
                    authrequest: authrequest, 
                    authresponse: authresponse,
                    tokenrequest: tokenrequest,
                    report: report,
                    report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
                }
            });

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestTokenRequestClass = require("../../test/" + tests[t]);
                    test = new TestTokenRequestClass(metadata, authrequest, authresponse, tokenrequest);
                    test.setDatabase(database);

                    if(test.hook==hook) {
                        result = await test.getResult();

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);
                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let tokenresponse = {};

        { // token-response
            let hook = "token-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestTokenResponseClass = require("../../test/" + tests[t]);
                    test = new TestTokenResponseClass(metadata, authrequest, authresponse, tokenrequest, tokenresponse);
                    test.setDatabase(database);

                    if(test.hook==hook) {
                        result = await test.getResult();

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);
                        console.log(result);
                        report.push(result);
                    }

                    tokenresponse = await test.getTokenResponse();
                    res.set(test.getHeaders());
                }
            }
        }

        database.setStep(request.req_id, 'tokenresponse', tokenresponse);        
        database.setLastLog(user, external_code, store_type, testsuite, {
            details: {
                metadata: metadata,
                authrequest: authrequest,
                authresponse: authresponse, 
                tokenrequest: tokenrequest,
                tokenresponse: tokenresponse,
                report: report,
                report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        });

        // make tokenresponse
        console.log("Token Response", tokenresponse);
        res.status(200).json(tokenresponse);
    });

    // OIDC Userinfo Endpoint
    app.all("/userinfo", async function(req, res) { 

        // Authorization: Bearer access_token
        let access_token = req.get('Authorization').substring(7);
        
        let userinforequest = {
            method: req.method,
            access_token: access_token
        }

        console.log("Userinfo Request", userinforequest);     

        if(!access_token) res.status(400).json({
            error: 'invalid_grant',
            description: 'access_token not valid'
        });
 
        let external_code = null;
        let request = database.getRequestByAccessToken(access_token);
        let user = request.user;
        let store_type = request.store_type;
        let testsuite = request.testsuite;
        let testcase = request.testcase;

        let metadata = database.getMetadata(user, store_type);
        let authrequest = database.getStepValue(request.req_id, 'authrequest');
        let authresponse = database.getStepValue(request.req_id, 'authresponse');
        let tokenrequest = database.getStepValue(request.req_id, 'tokenrequest');
        let tokenresponse = database.getStepValue(request.req_id, 'tokenresponse');
        
        let report = [];

        { // userinfo-request
            let hook = "userinfo-request";

            database.setLastLog(user, external_code, store_type, testsuite, {
                details: {
                    metadata: metadata,
                    authrequest: authrequest,
                    authresponse: authresponse, 
                    tokenrequest: tokenrequest,
                    tokenresponse: tokenresponse,
                    userinforequest: userinforequest,
                    report: report,
                    report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
                    },
            });

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestUserinfoRequestClass = require("../../test/" + tests[t]);
                    test = new TestUserinfoRequestClass(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest);
                    test.setDatabase(database);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);
                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let userinforesponse = {};

        { // userinfo-response
            let hook = "userinfo-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestUserinfoResponseClass = require("../../test/" + tests[t]);
                    test = new TestUserinfoResponseClass(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse={});
                    test.setDatabase(database);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);
                        console.log(result);
                        report.push(result);
                    }

                    userinforesponse = await test.getUserinfoResponse();
                    res.set(test.getHeaders());
                }
            }
        }

        database.setLastLog(user, external_code, store_type, testsuite, {
            details: {
                metadata: metadata,
                authrequest: authrequest,
                authresponse: authresponse, 
                tokenrequest: tokenrequest,
                tokenresponse: tokenresponse,
                userinforequest: userinforequest,
                userinforesponse: userinforesponse,
                report: report,
                report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        });

        // make userinforesponse
        console.log("Userinfo Response", userinforesponse);
        res.status(200).json(userinforesponse);
    });







    /* --- INNER FUNCTIONS --- */

    async function makeMetadata() {
        return {
            issuer: config_op.issuer,
            authorization_endpoint: config_op.authorization_endpoint,
            token_endpoint: config_op.token_endpoint,
            userinfo_endpoint: config_op.userinfo_endpoint,
            introspection_endpoint: config_op.introspection_endpoint,
            revocation_endpoint: config_op.revocation_endpoint,
            jwks: await makeJWKS(),
            organization_name: config_op.op_name,
            homepage_uri: config_op.op_uri,
            request_object_signing_alg_values_supported: ["RS256", "RS512"],
            id_token_signing_alg_values_supported: ["RS256", "RS512"],
            userinfo_signing_alg_values_supported: ["RS256", "RS512"],
            userinfo_encryption_alg_values_supported: ["RSA-OAEP", "RSA-OAEP-256"],
            userinfo_encryption_enc_values_supported: ["A128CBC-HS256", "A256CBC-HS512"],
            token_endpoint_auth_method_supported: ["private_key_jwt"],
            acr_values_supported: ["https://www.spid.gov.it/SpidL1", "https://www.spid.gov.it/SpidL2", "https://www.spid.gov.it/SpidL3"],
            request_parameter_supported: true,
            subject_types_supported: ["pairwise"],
            response_types_supported: ["code"]
        };
    }

    async function makeEntityStatement() {
        const config_key = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-sig.key'));
        const organization_name = "Agenzia per l'Italia Digitale";
        const keystore = jose.JWK.createKeyStore();
        
        const key = await keystore.add(config_key, 'pem');
        const thumbprint = await key.thumbprint('SHA-256');

        const header = {
            kid: base64url.encode(thumbprint),
            //x5c: [x5c.toString("base64")]
        }

        const iat = moment();
        const exp = iat.clone().add(1, 'years')

        const payload = JSON.stringify({ 
            iss: config_op.issuer,
            sub: config_op.issuer,
            iat: iat.unix(),
            exp: exp.unix(),
            jwks: await makeJWKS(),
            metadata: {
                "federation_entity": {
                    "homepage_uri": config_op.op_uri,
                    "policy_uri": config_op.op_uri + "/policy",
                    "logo_uri": config_op.op_uri + "/logo.svg",
                    "contacts": ["spid.tech@agid.gov.it"],
                    "federation_resolve_endpoint": null,
                    "organization_name": config_op.op_name
                },
                "openid_provider": await makeMetadata(),
            },
            authority_hints: [
                "https://registry.spid.gov.it"
            ],
            trust_marks: [
    
            ]
        });

        const entity_statement = await jose.JWS.createSign({
            format: 'compact',
            alg: 'RS256',
            fields: {...header}
        }, key).update(payload).final();

        return entity_statement;
    }

    async function makeJWKS() {

        const crt_sig = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-sig.crt'));
        const crt_enc = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-enc.crt'));
        const x5c_sig = new x509.X509Certificate(crt_sig);
        const x5c_enc = new x509.X509Certificate(crt_enc);
        const keystore = jose.JWK.createKeyStore();

        let jwk_sig = await jose.JWK.asKey(crt_sig, 'pem');
        let jwk_enc = await jose.JWK.asKey(crt_enc, 'pem');

        let thumb_sig = await jwk_sig.thumbprint('SHA-256');
        let thumb_enc = await jwk_enc.thumbprint('SHA-256');

        var props_sig = {
            kid: base64url.encode(thumb_sig),
            alg: 'RS256',
            use: 'sig',
            x5c: [x5c_sig.toString("base64")]
        };

        var props_enc = {
            kid: base64url.encode(thumb_enc),
            alg: 'RSA-OAEP-256',
            use: 'enc',
            x5c: [x5c_enc.toString("base64")]
        };

        await keystore.add(crt_sig, 'pem', props_sig),
        await keystore.add(crt_enc, 'pem', props_enc);

        const jwks = keystore.toJSON(false);

        return jwks;
    }
}