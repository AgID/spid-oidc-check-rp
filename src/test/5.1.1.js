const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_1_1 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.1.1";
        this.description = "Correct Grant Token Introspection Response for active=false";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(401);
 
        this.introspectionresponse = {
            active: false
        }

        return true;
    }
 
}

module.exports = Test_5_1_1