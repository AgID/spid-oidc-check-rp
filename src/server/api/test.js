const fs = require('fs-extra');
const axios = require('axios').default;
const moment = require('moment');
const validator = require('validator');
const Utility = require('../lib/utils');
const config_dir = require('../../config/dir.json');
const config_test = require("../../config/test.json");
const Test = require('../lib/test/Test.js');

 
module.exports = function(app, checkAuthorisation) {

    app.get("/api/test/suite/:testsuite", function(req, res) {

        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let testsuite = req.params.testsuite;

        // deep copy
        let testsuite_config = JSON.parse(JSON.stringify((config_test[testsuite])));

        let cases = Object.keys(testsuite_config.cases);
        for(c in cases) {
            let hook = Object.keys(testsuite_config.cases[cases[c]].hook);
            for(h in hook) {
                let hook_tests = testsuite_config.cases[cases[c]].hook[hook[h]];
                let hook_tests_list = [];
                for(ht in hook_tests) {
                    let TestClass = require('../../test/' + hook_tests[ht] + '.js');
                    let testObj = new TestClass();
                    let test_detail = {
                        num: hook_tests[ht],
                        description: testObj.description
                    };
                    hook_tests_list.push(test_detail);
                }
                testsuite_config.cases[cases[c]].hook[hook[h]] = hook_tests_list;
            }
        }


        res.status(200).send(testsuite_config);
    });


}
