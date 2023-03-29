const fs = require('fs-extra');
const axios = require('axios');
const qs = require('qs');
const moment = require('moment');
const jose = require('node-jose');
const validator = require('validator');
const jwt_decode = require("jwt-decode");
const Utility = require('../lib/utils');
const config_dir = require('../../config/dir.json');
const config_test = require("../../config/test.json");
const config_op = require("../../config/op.json");
const private_key = fs.readFileSync(__dirname + '/../../config/spid-oidc-check-rp-enc.key','utf8');

 
module.exports = function(app, checkAuthorisation, database) {


    app.get("//api/oidc/check/:testcase", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let report = [];
        let num_success = 0;
        let num_warning = 0;
        let num_failure = 0;

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.query.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let external_code = (authorisation=='API')? req.query.external_code : req.session.external_code;

        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : req.session.store.metadata;

        let testsuite = "oidc-core";

        let authrequest = req.session.authrequest;

        { // authentication-request
            let hook = "authentication-request";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestAuthRequestClass = require("../../test/" + tests[t]);
                    test = new TestAuthRequestClass(metadata, authrequest);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let code = database.saveRequest(
            user, store_type, testsuite, testcase, 
            authrequest.request_payload
        );
        
        let authresponse = {
            code: code,
            state: authrequest.request_payload.state,
            iss: config_op.issuer
        };

        { // authentication-response
            let hook = "authentication-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestAuthResponseClass = require("../../test/" + tests[t]);
                    test = new TestAuthResponseClass(metadata, authrequest, authresponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }

                    authresponse = await test.getAuthResponse();
                }
            }
        }



        let summary_result = "";
        if(num_failure>0) {
            summary_result = "failure";
        } else if(num_warning>0) {
            summary_result = "warning";
        } else {
            summary_result = "success";
        }

        let log = {
            summary: {
                result: summary_result,
                num_success: num_success,
                num_warning: num_warning,
                num_failure: num_failure
            },
            details: {
                metadata: metadata,
                authrequest: authrequest,
                authresponse: authresponse, 
                //tokenrequest: tokenrequest,
                //tokenresponse: tokenresponse.data,
                //refreshtokenrequest: refreshtokenrequest,
                //refreshtokenresponse: actualtokenresponse.data,
                //userinforequest: userinforequest,
                //userinforesponse: userinforesponse.data,
                //userinfo: userinfo_data,
                report: report,
                report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        };

        database.setLastLog(user, external_code, store_type, testsuite, log);

        // make authresponse
        console.log("Authorization Response", authresponse);
        res.status(200).send(authresponse);
    });

    app.get("//api/oidc/report", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
                
        // get report
        let testsuite = "oidc-core";
        let report = database.getReport(user, store_type, testsuite);

        console.log("Report", report);

        if((!report || report=={}) && !req.session.authrequest) {
            res.status(404).send();
        }

        // override current authrequest without replace old report 
        if(req.session.authrequest) {
            if(!report) report = {};
            if(!report.lastlog) report.lastlog = {};
            if(!report.lastlog.details) report.lastlog.details = {};
            report.lastlog.details.authrequest = req.session.authrequest;
        }

        res.status(200).send(report);
    });

    app.patch("//api/oidc/report/:testcase/:hook/:test", async function(req, res) {
        
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let hook = req.params.hook;
        let test = req.params.test;
        let patch_data = req.body.data;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;
        
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
                
        // get report
        let testsuite = "oidc-core";
        let report = database.getReport(user, store_type, testsuite);

        // get test and patch
        let saved_test = report['cases'][testcase]['hook'][hook][test];
        for(let p in patch_data) {
            saved_test[p] = patch_data[p]; 
        }
        database.setTest(user, external_code, store_type, testsuite, testcase, hook, saved_test);

        // retrieve new report
        report = database.getReport(user, store_type, testsuite);

        console.log("Report", report);
        if(!report || report=={}) {
            res.status(404).send();
        } else {
            res.status(200).send(report);
        }
    });
    
    /*

    app.get("//redirect", async function(req, res) {
        
        let report = [];
        let num_success = 0;
        let num_warning = 0;
        let num_failure = 0;

        let authresponse = req.query;
        console.log("Authentication Response", authresponse);

        // get authcode
        let authcode = authresponse.code;
        let state = authresponse.state;

        let user = req.session.user;
        let store_type = (req.session.store_type)? req.session.store_type : 'test';
        let organization = (req.session.entity)? req.session.entity.id : null;
        let external_code = req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = database.getMetadata(user, store_type);
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }

        // retrieve request
        let request = database.getRequest(state);
        let authrequest = request.authrequest;
        console.log("Saved Request", request);

        let testsuite = request.testsuite;
        let testcase = request.testcase;

        {   // authentication response
            let hook = "authentication-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestAuthResponseClass = require("../../test/" + tests[t]);
                    test = new TestAuthResponseClass(metadata, authrequest, authresponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let tokenrequest = {};
        let tokenresponse = {};
        let actualtokenresponse = {}; // from token request or new refresh token request

        { // token request
            let hook = "token-request";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {

                let test = null;
                for(let t in tests) {
                    let TestTokenRequestClass = require("../../test/" + tests[t]);
                    test = new TestTokenRequestClass(metadata, authrequest, authresponse, tokenrequest);
                    if(test.hook==hook) {
                        tokenrequest = await test.getTokenRequest();
                        
                        // save request
                        //database.saveRequest(authrequest.state, user, store_type, testsuite, testcase, authrequest);

                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }

                // send token request
                console.log("Token Request", qs.stringify(tokenrequest));

                try {
                    tokenresponse = await axios.post(
                        metadata.configuration.token_endpoint, 
                        qs.stringify(tokenrequest), 
                        {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
                    );

                    console.log("Token Response", tokenresponse.data);

                    actualtokenresponse = tokenresponse;
                    
                } catch(error) {
                    console.log("Token Request ERROR", error.response.data);

                    /*
                    return res.status(400).json({
                        error: "Token Request ERROR",
                        error_message: error.response.data,
                        metadata: metadata,
                        authrequest: authrequest,
                        authresponse: authresponse,
                        tokenrequest: tokenrequest
                    });
                    

                    // error response from token endpoint MUST be checked
                    actualtokenresponse = error.response;
                }
            }
        }
        
        { // token response
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
                    test = new TestTokenResponseClass(metadata, authrequest, authresponse, tokenrequest, actualtokenresponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let refreshtokenrequest = {};
        let refreshtokenresponse = {};

        { // refresh token request
            let hook = "refresh-token-request";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {

                let test = null;

                for(let t in tests) {
                    let TestRefreshTokenRequestClass = require("../../test/" + tests[t]);
                    test = new TestRefreshTokenRequestClass(metadata, authrequest, authresponse, tokenrequest, tokenresponse, refreshtokenrequest);
                    if(test.hook==hook) {
                        refreshtokenrequest = await test.getRefreshTokenRequest();
                        
                        // save request
                        //database.saveRefreshTokenRequest ?

                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            
                // send refresh token request
                console.log("Refresh Token Request", qs.stringify(refreshtokenrequest));

                try {
                    refreshtokenresponse = await axios.post(
                        metadata.configuration.token_endpoint, 
                        qs.stringify(refreshtokenrequest), 
                        {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
                    );

                    console.log("Refresh Token Response", refreshtokenresponse.data);

                    // if refresh token request is successful, the response is the new token response
                    actualtokenresponse = refreshtokenresponse; 

                } catch(error) {
                    console.log("Refresh Token Request ERROR", error.response.data);

                    /*
                    return res.status(400).json({
                        error: "Token Request ERROR",
                        error_message: error.response.data,
                        metadata: metadata,
                        authrequest: authrequest,
                        authresponse: authresponse,
                        tokenrequest: tokenrequest,
                        tokenresponse: tokenresponse.data,
                        refreshtokenrequest: refreshtokenrequest
                    });
                    

                    // error response from token endpoint MUST be checked
                    actualtokenresponse = error.response; 
                }
            }
        }
        
        { // refresh token response
            let hook = "refresh-token-response";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {
                for(let t in tests) {
                    let TestRefreshTokenResponseClass = require("../../test/" + tests[t]);
                    test = new TestRefreshTokenResponseClass(metadata, authrequest, authresponse, tokenrequest, tokenresponse, refreshtokenrequest, actualtokenresponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        let userinforequest = {};
        let userinforesponse = {};

        { // userinfo request
            let hook = "userinfo-request";

            let tests = config_test[testsuite].cases[testcase].hook[hook]; 
            let testcase_name = config_test[testsuite].cases[testcase].name;
            let testcase_description = config_test[testsuite].cases[testcase].description;
            let testcase_referements = config_test[testsuite].cases[testcase].ref;
            console.log("Test case name: " + testcase_name);
            console.log("Referements: " + testcase_referements);
            console.log("Test list to be executed: ", tests);

            if(tests!=null) {

                let test = null;
                for(let t in tests) {
                    let TestUserinfoRequestClass = require("../../test/" + tests[t]);
                    test = new TestUserinfoRequestClass(metadata, authrequest, authresponse, tokenrequest, actualtokenresponse, userinforequest);
                    if(test.hook==hook) {
                        userinforequest = await test.getUserinfoRequest();

                        // save request
                        //database.saveRequest(authrequest.state, user, store_type, testsuite, testcase, authrequest);

                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }

                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }

                // send userinfo request
                console.log("Userinfo Request", userinforequest);

                try {
                    userinforesponse = await axios.get(
                        metadata.configuration.userinfo_endpoint, 
                        {headers: userinforequest}
                    );

                    console.log("Userinfo Response", userinforesponse.data);
                    
                } catch(error) {
                    console.log("Userinfo Request ERROR", error.response.data);
                    return res.status(400).json({
                        error: "Userinfo Request ERROR",
                        error_message: error.response.data,
                        metadata: metadata,
                        authrequest: authrequest,
                        authresponse: authresponse,
                        tokenrequest: tokenrequest,
                        tokenresponse: tokenresponse.data,
                        refreshtokenrequest: refreshtokenrequest,
                        refreshtokenresponse: refreshtokenresponse.data,
                        userinforequest: userinforequest
                    });
                }
            }
        }
        
        {   // userinfo response
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
                    test = new TestUserinfoResponseClass(metadata, authrequest, authresponse, tokenrequest, actualtokenresponse, userinforequest, userinforesponse);
                    if(test.hook==hook) {
                        result = await test.getResult();

                        switch(test.validation) {
                            case 'automatic':
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'self': 
                                switch(result.result) {
                                    case 'success': num_success++; break;
                                    case 'failure': num_failure++; break;
                                }
                            break;
                            case 'required': num_warning++; break;
                        }
                        
                        // save single test to store
                        database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                        console.log(result);
                        report.push(result);
                    }
                }
            }
        }

        // grab userinfo claims
        let userinfo_data = {};
        if(userinforesponse.data) {
            let keystore_rp = jose.JWK.createKeyStore();
            await keystore_rp.add(private_key, 'pem');
            let userinfo_sig_token_obj = await jose.JWE.createDecrypt(keystore_rp).decrypt(userinforesponse.data);
            userinfo_data = jwt_decode(userinfo_sig_token_obj.payload.toString());
        }

        let summary_result = "";
        if(num_failure>0) {
            summary_result = "failure";
        } else if(num_warning>0) {
            summary_result = "warning";
        } else {
            summary_result = "success";
        }
        

        let log = {
            summary: {
                result: summary_result,
                num_success: num_success,
                num_warning: num_warning,
                num_failure: num_failure
            },
            userinfo: userinfo_data,
            details: {
                metadata: metadata,
                authrequest: authrequest,
                authresponse: authresponse,
                tokenrequest: tokenrequest,
                tokenresponse: tokenresponse.data,
                refreshtokenrequest: refreshtokenrequest,
                refreshtokenresponse: actualtokenresponse.data,
                userinforequest: userinforequest,
                userinforesponse: userinforesponse.data,
                userinfo: userinfo_data,
                report: report,
                report_datetime: moment().format("YYYY-MM-DD HH:mm:ss")
            }
        };

        // save log to store
        database.setLastLog(user, external_code, store_type, testsuite, log);

        res.status(200).json(log);
    });



    */
}
