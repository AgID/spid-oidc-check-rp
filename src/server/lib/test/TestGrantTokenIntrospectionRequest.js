const Test = require('./Test.js');
const moment = require('moment');

class TestGrantTokenIntrospectionRequest extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, userinforequest={}, userinforesponse={}, introspectionrequest={}) {
        super();
        this.hook = "granttoken-introspection-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.userinforequest = userinforequest;
        this.userinforesponse = userinforesponse;
        this.introspectionrequest = introspectionrequest;
    }

    exec() {
        super.exec();
    }

    async getIntrospectionRequest() {
        await this.exec();
        return this.introspectionrequest;
    }
}

module.exports = TestGrantTokenIntrospectionRequest 