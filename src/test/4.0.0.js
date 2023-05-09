const TestUserinfoRequest = require('../server/lib/test/TestUserinfoRequest.js');

class Test_4_0_0 extends TestUserinfoRequest {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest);
        this.num = "4.0.0";
        this.description = "the request MUST be sent on HTTP GET method";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.userinforequest.method.toLowerCase()!='get') {
            this.notes = this.userinforequest.method;
            throw new Error("the request has not be sent on HTTP GET method");
        }
 
        this.notes = this.userinforequest.method;
        return true;
    }
 
}

module.exports = Test_4_0_0