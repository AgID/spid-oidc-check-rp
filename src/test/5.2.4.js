const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_2_4 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.2.4";
        this.description = "Introspection Error Response - parameter error_description is not present";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(401);
 
        this.introspectionresponse = {
            error: 'invalid_client'
        }

        return true;
    }
 
}

module.exports = Test_5_2_4