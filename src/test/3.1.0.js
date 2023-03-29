const TestTokenResponse = require('../server/lib/test/TestTokenResponse.js');

class Test_3_1_0 extends TestTokenResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest) {
        super(metadata, authrequest, authresponse, tokenrequest);
        this.num = "3.1.0";
        this.description = "correct token response";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        this.setHeader('Cache-Control', 'no-store');
        this.setHeader('Pragma', 'no-cache');
        
        this.tokenresponse = {
            access_token: "access_token",
            token_type: "Bearer",
            refresh_token: "refresh_token",
            expires_in: "60",
            id_token: "id_token"
        }

        return true;
    }
 
}

module.exports = Test_3_1_0