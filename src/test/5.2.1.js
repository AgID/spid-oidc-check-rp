const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_2_1 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.2.1";
        this.description = "Introspection Error Response - Content-Type is not 'application/json'";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(401);

        this.setHeader('Content-Type', "text/plain");
 
        this.introspectionresponse = {
            error: 'invalid_client',
            error_description: 'client_id non riconosciuto.'
        }

        return true;
    }
 
}

module.exports = Test_5_2_1