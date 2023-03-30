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

        let req_id = database.getRequestByCode(code).req_id;
        database.setStep(req_id, 'authrequest', authrequest.request_payload); 

        let authresponse = {
            code: code,
            state: authrequest.request_payload.state,
            iss: config_op.issuer
        };

        database.setStep(req_id, 'authresponse', authresponse); 
        

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
    
}
