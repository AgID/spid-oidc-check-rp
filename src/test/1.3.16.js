const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_16 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.16";
        this.description = "The metadata MUST contain the claim id_token_signed_response_alg";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.id_token_signed_response_alg==null
            || this.metadata.configuration.id_token_signed_response_alg=='') {
            this.notes = this.metadata.configuration;
            throw new Error("the claim id_token_signed_response_alg is not present");
        } 

        this.notes = this.metadata.configuration.id_token_signed_response_alg;
        return true;

    }

}

module.exports = Test_1_3_16