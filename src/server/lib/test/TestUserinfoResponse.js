const Test = require('./Test.js');
const moment = require('moment');

class TestUserinfoResponse extends Test {

    constructor(metadata, authrequest={}, authresponse={}, tokenrequest={}, tokenresponse={}, userinforequest={}, userinforesponse={}) {
        super();
        this.hook = "userinfo-response";
        this.metadata = metadata;
        this.authrequest = authrequest;
        this.authresponse = authresponse;
        this.tokenrequest = tokenrequest;
        this.tokenresponse = tokenresponse;
        this.userinforequest = userinforequest;
        this.userinforesponse = userinforesponse;
    }

    exec() {
        super.exec();
    }

    async getUserinfoResponse() {
        let userinforesponse = null;
        try {
            await this.exec();
            userinforesponse = this.userinforesponse;
        } catch(error) {
            console.log(error);
        }
        return userinforesponse;
    }
}

module.exports = TestUserinfoResponse 