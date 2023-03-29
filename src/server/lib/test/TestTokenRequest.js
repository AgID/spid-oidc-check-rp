const Test = require('./Test.js');
const moment = require('moment');

class TestTokenRequest extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}) {
        super();
        this.hook = "token-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
    }

    exec() {
        super.exec();
    }

    async getTokenRequest() {
        await this.exec();
        return this.tokenrequest;
    }
}

module.exports = TestTokenRequest 