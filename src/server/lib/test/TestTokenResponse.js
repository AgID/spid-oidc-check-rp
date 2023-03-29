const Test = require('./Test.js');
const moment = require('moment');

class TestTokenResponse extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}) {
        super();
        this.hook = "token-response";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
    }

    exec() {
        super.exec();
    }

    async getTokenResponse() {
        let tokenresponse = null;
        try {
            await this.exec();
            tokenresponse = this.tokenresponse;
        } catch(error) {
            console.log(error);
        }
        return tokenresponse;
    }
}

module.exports = TestTokenResponse 