const TestTokenRequest = require('../server/lib/test/TestTokenRequest.js');

class Test_3_0_0 extends TestTokenRequest {

    constructor(metadata, authrequest, authresponse, tokenrequest) {
        super(metadata, authrequest, authresponse, tokenrequest);
        this.num = "3.0.0";
        this.description = "Content-Type MUST be application/x-www-form-urlencoded";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(!this.tokenrequest.mimetype || this.tokenrequest.mimetype!='application/x-www-form-urlencoded') {
            this.notes = this.tokenrequest.mimetype;
            throw("Content-Type is not application/x-www-form-urlencoded");
        }
 
        this.notes = this.tokenrequest.mimetype;
        return true;
    }
 
}

module.exports = Test_3_0_0