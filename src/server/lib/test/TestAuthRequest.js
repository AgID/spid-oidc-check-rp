const Test = require('./Test.js');
const moment = require('moment');

class TestAuthRequest extends Test {

    constructor(metadata, authrequest={}) {
        super();
        this.hook = "authentication-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
    }

    exec() {
        super.exec();
    }

    async getAuthRequest() {
        await this.exec();
        return this.authrequest;
    }
}

module.exports = TestAuthRequest 