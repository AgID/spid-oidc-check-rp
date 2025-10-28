const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_2_4_7 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "2.4.7";
        this.description = "the value of error is 'invalid_request'";
        this.validation = "self";
    }

    async exec() {
        super.exec();
        let redirect_uri = this.authrequest.request_payload.redirect_uri;
        let redirect_uris = this.metadata.configuration.redirect_uris;
        if(!redirect_uris.includes(redirect_uri)) {
            this.notes = redirect_uri + " is not in " + JSON.stringify(redirect_uris);
            throw new Error("redirect_uri " + redirect_uri + " is not included into metadata redirect_uris");
        } 
 
        this.authresponse.url = redirect_uri 
            + "?error=invalid_request"
            + "&error_description=invalid_request"
            + "&state=" + this.authresponse.state

        return true;
    }
 
}

module.exports = Test_2_4_7