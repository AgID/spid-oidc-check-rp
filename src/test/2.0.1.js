const TestAuthRequest = require('../server/lib/test/TestAuthRequest.js');

class Test_2_0_1 extends TestAuthRequest {

    constructor(metadata, authrequest) {
        super(metadata, authrequest);
        this.num = "2.0.1";
        this.description = "the parameter request MUST be present";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        if(this.authrequest.request==null
            || this.authrequest.request=='') {
            this.notes = this.authrequest;
            throw("parameter request is not present");
        } else {
            this.notes = this.authrequest.request;
            return true;
        }
    }

}

module.exports = Test_2_0_1