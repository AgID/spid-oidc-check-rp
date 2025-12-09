const Test = require('./Test.js');
const moment = require('moment');

class TestIntrospectionRequest extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, userinforequest={}, introspectonrequest={}) {
        super();
        this.hook = "introspection-request";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.userinforequest = userinforequest;
        this.introspectonrequest = introspectonrequest;
    }

    exec() {
        super.exec();
    }

    async getIntrospectionRequest() {
        await this.exec();
        return this.introspectionrequest;
    }
}

module.exports = TestIntrospectionRequest 