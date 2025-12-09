const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_2_0 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.2.0";
        this.description = "Correct Introspection Error Response for invalid_client";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(401);
 
        this.introspectionresponse = {
            error: 'invalid_client',
            error_description: 'client_id non riconosciuto.'
        }

        return true;
    }
 
}

module.exports = Test_5_2_0