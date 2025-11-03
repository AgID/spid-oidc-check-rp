const fs = require('fs-extra');
const axios = require('axios').default;
const moment = require('moment');
const validator = require('validator');
const jwt_decode = require('jwt-decode');
const Utility = require('../lib/utils');
const config_dir = require('../../config/dir.json');
const config_test = require("../../config/test.json");


module.exports = function(app, checkAuthorisation, database) {

    // get downloaded metadata
    /*
    app.get("/api/metadata", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        if(authorisation=='API' && !req.query.user) { return res.status(400).send("Parameter user is missing"); }
        if(authorisation=='API' && !req.query.organization) { return res.status(400).send("Parameter organization is missing"); }
        if(authorisation=='API' && !req.query.store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(authorisation=='API' && !req.body.entity_id) { return res.status(400).send("Parameter entity_id is missing"); }

        let entity_id = req.query.entity_id; 

        if(authorisation!='API') {
            if(req.session.entity_id) {
                entity_id = req.session.entity_id;
            } else {
                let request = req.session.request;
                if(!request || !request.issuer) { return res.status(400).send("EntityID or Session not found"); }    
                entity_id = request.issuer;
            }
        }

        let user = (authorisation=='API')? req.query.user : req.session.user;
        let organization = (authorisation=='API')? req.query.organization : req.session.entity.id;
        let store_type = (authorisation=='API')? req.query.store_type : 
            (req.session.metadata && req.session.metadata.store_type)? req.session.metadata.store_type : 'main';
    
        if(!fs.existsSync(config_dir.DATA)) return res.render('warning', { message: "Directory /specs-compliance-tests/data is not found. Please create it and reload." });
        req.session.metadata = null;

        let result = null;

        if(entity_id) {
            let savedMetadata = database.getMetadata(user, entity_id, store_type);
            if(savedMetadata) {
                req.session.metadata = savedMetadata;
                fs.writeFileSync(getEntityDir(entity_id) + "/sp-metadata.xml", savedMetadata.xml, "utf8");

                let metadataParser = new MetadataParser(savedMetadata.xml);
                let entityID = metadataParser.getServiceProviderEntityId();
                let organization_description = metadataParser.getOrganization().displayName;
                let metadata_type = metadataParser.isMetadataForAggregated()? 'AG':'SP'; 
                
                result = {
                    type: metadata_type,
                    entity_id: entityID,
                    organization_code: organization,
                    organization_description: organization_description,
                    url: savedMetadata.url,
                    xml: savedMetadata.xml
                };
            }

        } else {
            let listMetadata = database.getUserMetadata(user, organization, store_type);
            result = listMetadata;
        }
        

        res.status(200).send(result);
    });
    */

    // download metadata 
    app.post("/api/metadata/:type/download", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let url = req.body.url;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;
        let type = req.params.type;

        if(!url) { return res.status(500).send("Please insert a valid URL"); }
        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }
        if(type!='configuration' && type!='federation') return res.status(400).send('Metadata type MUST be configuration or federation');

        if(type=='configuration') {
            axios.get(url, {
                responseType: "json",
            })
                .then(function(response) {
                    let configuration = response.data;
                    Utility.log(".well-known/openid-configuration", url);
                    console.log(configuration);

                    if(!validator.isJSON(JSON.stringify(configuration),
                        { allow_primitives: true })) {
                        Utility.log("Error while parsing JSON");
                        throw "Error while parsing JSON";
                    }

                    let metadata = {
                        url: url,
                        type: 'configuration',
                        entity_statement: null,
                        configuration: configuration
                    };

                    database.setMetadata(user, external_code, store_type, metadata);
                    if (!req.session.store) {
                        req.session.store = {};
                    }
                    req.session.store.metadata = metadata;
                    res.status(200).json(metadata);
                })
                .catch(function(err) {
                    Utility.log("ERR /api/metadata/download", err);
                    res.status(500).send(err.toString());
                });
        } else if(type=='federation') {
            axios.get(url, {
                responseType: "application/entity-statement+jwt",
            })
                .then(function(response) {
                    let entity_statement = response.data;
                    Utility.log(".well-known/openid-federation", url);
                    console.log(entity_statement);

                    let decoded_entity_statement = jwt_decode(entity_statement);
                    let configuration = decoded_entity_statement['metadata']['openid_relying_party'];

                    if(!validator.isJSON(JSON.stringify(configuration),
                        { allow_primitives: true })) {
                        Utility.log("Error while parsing JSON");
                        throw "Error while parsing JSON";
                    }

                    let metadata = {
                        url: url,
                        type: 'federation',
                        entity_statement: entity_statement,
                        configuration: configuration
                    };

                    database.setMetadata(user, external_code, store_type, metadata);
                    if (!req.session.store) {
                        req.session.store = {};
                    }
                    req.session.store.metadata = metadata;
                    res.status(200).json(metadata);
                })
                .catch(function(err) {
                    Utility.log("ERR /api/metadata/download", err);
                    res.status(500).send(err.toString());
                });

        } else {
            // other types not supported
        }
    });

    // execute test for metadata
    app.get("/api/metadata/check/:testcase", async function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : (req.session.store ? req.session.store.metadata : null);
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }
        console.log("metadata", metadata);

        let testsuite = "metadata";
        let hook = "metadata";

        let tests = config_test[testsuite].cases[testcase].hook[hook];
        let testcase_name = config_test[testsuite].cases[testcase].name;
        let testcase_description = config_test[testsuite].cases[testcase].description;
        let testcase_referements = config_test[testsuite].cases[testcase].ref;
        console.log("Test case name: " + testcase_name);
        console.log("Referements: " + testcase_referements);
        console.log("Test list to be executed: ", tests);

        let report = [];
        let report_datetime = moment().format("YYYY-MM-DD HH:mm:ss");
        for(t in tests) {
            let TestClass = require("../../test/" + tests[t]);
            let test = new TestClass(metadata);
            if(test.hook==hook) {
                let result = await test.getResult();

                // save single test to store
                database.setTest(user, external_code, store_type, testsuite, testcase, hook, result);

                console.log(result);
                report.push(result);
            }
        }

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

    // return last validation from store
    app.get("/api/metadata/lastcheck/:testcase", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let store = database.getStore(user, store_type);

        let testsuite = "metadata";
        let hook = "metadata";

        // if the last validation not exists, reroute for check
        if(!store.test[testsuite]) {
            res.status(404).send();
            return;
        }

        let testcase_name = store.test[testsuite]['cases'][testcase].name;
        let testcase_description = store.test[testsuite]['cases'][testcase].description;
        let testcase_referements = store.test[testsuite]['cases'][testcase].ref;
        let report_datetime =  store.test[testsuite]['cases'][testcase].datetime;

        let report = [];
        let tests = store.test[testsuite]['cases'][testcase]['hook'][hook];
        for(t in tests) report.push(tests[t]);

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

    /*
    // delete metadata
    app.delete("/api/metadata", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        if(authorisation=='API') {
            if(!req.query.user) { return res.status(400).send("Parameter user is missing"); }
            if(!req.query.store_type) { return res.status(400).send("Parameter store_type is missing"); }
            //if(!req.query.external_code) { return res.status(400).send("Parameter external_code is missing"); }

            try {
                database.deleteStore(req.query.user, req.query.entity_id, req.query.store_type);
                res.status(200).send();

            } catch(exception) {
                res.status(500).send("Si è verificato un errore durante la cancellazione del metadata: " + exception.toString());
            }

        } else {
            res.status(401).send("Unhautorized");
        }

    });
    */

    // set test for metadata
    app.patch("/api/metadata/:testcase/:test", async function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testcase = req.params.testcase;
        let test = req.params.test;
        let patch_data = req.body.data;
        let user = (authorisation=='API')? req.body.user : req.session.user;
        let store_type = (authorisation=='API')? req.query.store_type : (req.session.store_type)? req.session.store_type : 'test';
        let organization = (authorisation=='API')? req.body.organization : (req.session.entity)? req.session.entity.id : null;
        let external_code = (authorisation=='API')? req.body.external_code : req.session.external_code;

        if(!user) { return res.status(400).send("Parameter user is missing"); }
        if(!store_type) { return res.status(400).send("Parameter store_type is missing"); }
        //if(!organization) { return res.status(400).send("Parameter organization is missing"); }
        //if(!external_code) { return res.status(400).send("Parameter external_code is missing"); }

        let metadata = (authorisation=='API')? database.getMetadata(req.query.user, store_type) : (req.session.store ? req.session.store.metadata : null);
        if(!metadata || !metadata.configuration) { return res.status(400).send("Please download metadata first"); }
        console.log("metadata", metadata);

        let store = database.getStore(user, store_type);

        let testsuite = "metadata";
        let hook = "metadata";

        // if the last validation not exists, reroute for check
        if(!store.test[testsuite]) {
            res.status(404).send();
            return;
        }

        // get test and patch
        let saved_test = store.test[testsuite]['cases'][testcase]['hook'][hook][test];
        for(let p in patch_data) {
            saved_test[p] = patch_data[p];
        }
        database.setTest(user, external_code, store_type, testsuite, testcase, hook, saved_test);

        // retrieve new testsuite data
        store = database.getStore(user, store_type);

        let testcase_name = store.test[testsuite]['cases'][testcase].name;
        let testcase_description = store.test[testsuite]['cases'][testcase].description;
        let testcase_referements = store.test[testsuite]['cases'][testcase].ref;
        let report_datetime =  store.test[testsuite]['cases'][testcase].datetime;

        let report = [];
        let tests = store.test[testsuite]['cases'][testcase]['hook'][hook];
        for(t in tests) report.push(tests[t]);

        res.status(200).send({
            testcase: testcase,
            name: testcase_name,
            description: testcase_description,
            referements: testcase_referements,
            report: report,
            datetime: report_datetime
        });
    });

}
