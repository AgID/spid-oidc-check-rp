const Test = require('./Test.js');
const moment = require('moment');

class TestRefreshTokenRequest extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, refreshtokenrequest={}) {
        super();
        this.hook = "refresh-token-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.refreshtokenrequest = refreshtokenrequest;
    }

    exec() {
        super.exec();
    }

    async getRefreshTokenRequest() {
        await this.exec();
        return this.refreshtokenrequest;
    }
}

module.exports = TestRefreshTokenRequest 