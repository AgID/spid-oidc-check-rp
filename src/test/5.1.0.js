const TestGrantTokenIntrospectionResponse = require('../server/lib/test/TestGrantTokenIntrospectionResponse.js');

class Test_5_1_0 extends TestGrantTokenIntrospectionResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse, introspectionrequest, introspectionresponse);
        this.num = "5.1.0";
        this.description = "Correct Grant Token Introspection Response (active=true or active=false if token not found)";
        this.validation = "self";
    }

    async exec() {
        super.exec();
 
        let grant_token = this.database.checkGrantToken(this.introspectionrequest.token);

        if(grant_token!==false) {

            this.introspectionresponse = {
                active: true,
                scope: grant_token['scope'],
                exp: grant_token['exp'],
                sub: grant_token['sub'],
                act: grant_token['act'],
                iss: grant_token['iss'],
                aud: grant_token['aud']
            };

        } else {

            this.introspectionresponse = {
                active: false
            }
        }

        return true;
    }
 
}

module.exports = Test_5_1_0