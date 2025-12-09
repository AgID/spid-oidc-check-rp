const Test = require('./Test.js');
const moment = require('moment');

class TestIntrospectionResponse extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, userinforequest={}, userinforesponse={}, introspectionrequest={}, introspectionresponse={}) {
        super();
        this.hook = "introspection-response";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.userinforequest = userinforequest;
        this.userinforesponse = userinforesponse;
        this.introspectionrequest = introspectionrequest;
        this.introspectionresponse = introspectionresponse;
    }

    exec() {
        super.exec();
    }

    async getIntrospectionResponse() {
        let introspectionresponse = null;
        try {
            await this.exec();
            introspectionresponse = this.introspectionresponse;
        } catch(error) {
            console.log(error);
        }
        return introspectionresponse;
    }
}

module.exports = TestIntrospectionResponse 