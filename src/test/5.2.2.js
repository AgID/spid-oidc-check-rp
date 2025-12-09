const TestIntrospectionResponse = require('../server/lib/test/TestIntrospectionResponse.js');

class Test_5_2_2 extends TestIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.2.2";
        this.description = "Introspection Error Response - HTTP Status Code is not one of [400, 401, 405, 500, 503]";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setStatusCode(404);
 
        this.introspectionresponse = {
            error: 'invalid_client',
            error_description: 'client_id non riconosciuto.' 
        }

        return true;
    }
 
}

module.exports = Test_5_2_2