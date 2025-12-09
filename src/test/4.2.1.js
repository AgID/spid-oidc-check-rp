const TestUserinfoResponse = require('../server/lib/test/TestUserinfoResponse.js');
const Utility = require('../server/lib/utils.js');
const moment = require('../server/node_modules/moment');
const jwt_decode = require('../server/node_modules/jwt-decode');
const config_op  = require('../config/op.json');


class Test_4_2_1 extends TestUserinfoResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse);
        this.num = "4.2.1";
        this.description = "HTTP Status Code is not 200 OK";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(405);
        this.userinforesponse = "Method not allowed";

        let request = this.database.getRequestByAccessToken(this.userinforequest.access_token);
        this.database.saveUserinfo(request['req_id'], this.userinforesponse);

        this.notes = this.userinforesponse;
        return true;
    }
 
}

module.exports = Test_4_2_1