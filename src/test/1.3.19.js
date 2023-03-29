const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_19 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.19";
        this.description = "The metadata MUST contain the claim userinfo_encrypted_response_enc";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.userinfo_encrypted_response_enc==null
            || this.metadata.configuration.userinfo_encrypted_response_enc=='') {
            this.notes = this.metadata.configuration;
            throw("the claim userinfo_encrypted_response_enc is not present");
        } 

        this.notes = this.metadata.configuration.userinfo_encrypted_response_enc;
        return true;

    }

}

module.exports = Test_1_3_19