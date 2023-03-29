const Test = require('./Test.js');
const moment = require('moment');

class TestAuthResponse extends Test {

    constructor(metadata, authrequest={}, authresponse={}) {
        super();
        this.hook = "authentication-response";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
    }

    exec() {
        super.exec();
    } 

    async getAuthResponse() {
        let authresponse = null;
        try {
            await this.exec();
            authresponse = this.authresponse;
        } catch(error) {
            console.log(error);
        }
        return authresponse;
    }
}

module.exports = TestAuthResponse 