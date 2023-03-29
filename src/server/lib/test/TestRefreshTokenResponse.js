const Test = require('./Test.js');
const moment = require('moment');

class TestRefreshTokenResponse extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, refreshtokenrequest={}, refreshtokenresponse={}) {
        super();
        this.hook = "refresh-token-response";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.refreshtokenrequest = refreshtokenrequest;
        this.refreshtokenresponse = refreshtokenresponse;
    }

    exec() {
        super.exec();
    }
}

module.exports = TestRefreshTokenResponse 