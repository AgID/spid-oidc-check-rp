const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_2_5 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.2.5";
        this.description = "Introspection Error Response - the value of error is different from ['invalid_client', 'invalid_request', 'server_error', 'temporarily_unavailable']";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(401);
 
        this.introspectionresponse = {
            error: 'unauthorized',
            error_description: 'unauthorized'
        }

        return true;
    }
 
}

module.exports = Test_5_2_5