const Test = require('./Test.js');
const moment = require('moment');

class TestUserinfoRequest extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, userinforequest={}) {
        super();
        this.hook = "userinfo-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.userinforequest = userinforequest;
    }

    exec() {
        super.exec();
    }

    async getUserinfoRequest() {
        await this.exec();
        return this.userinforequest;
    }
}

module.exports = TestUserinfoRequest 