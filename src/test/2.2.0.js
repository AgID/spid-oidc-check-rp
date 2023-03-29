const TestAuthResponse = require('../server/lib/test/TestAuthResponse.js');

class Test_2_2_0 extends TestAuthResponse {

    constructor(metadata, authrequest, authresponse) {
        super(metadata, authrequest, authresponse);
        this.num = "2.2.0";
        this.description = "correct response";
        this.validation = "self";
    }

    async exec() {
        super.exec();
        let redirect_uri = this.authrequest.request_payload.redirect_uri;
        let redirect_uris = this.metadata.configuration.redirect_uris;
        if(!redirect_uris.includes(redirect_uri)) {
            this.notes = redirect_uri + " is not in " + JSON.stringify(redirect_uris);
            throw("redirect_uri " + redirect_uri + " is not included into metadata redirect_uris");
        } 
 
        this.authresponse.url = redirect_uri 
            + "?code=" + this.authresponse.code
            + "&state=" + this.authresponse.state
            + "&iss=" + encodeURIComponent(this.authresponse.iss);

        return true;
    }
 
}

module.exports = Test_2_2_0