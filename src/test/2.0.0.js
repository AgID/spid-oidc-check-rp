const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_0_0 extends TestAuthRequest {

    constructor(metadata, authrequest) {
        super(metadata, authrequest);
        this.num = "2.0.0";
        this.description = "the request MUST be sent on HTTP method GET or POST";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        if(this.authrequest.method!='GET' && this.authrequest.method!='POST') {
            this.notes = this.authrequest;
            throw new Error("the request was not sent on HTTP method GET or POST");
        } else {
            this.notes = this.authrequest.method;
            return true;
        }
    }

}

module.exports = Test_2_0_0