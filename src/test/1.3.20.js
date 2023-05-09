const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_20 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.20";
        this.description = "The metadata MUST contain the claim token_endpoint_auth_method";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.token_endpoint_auth_method==null
            || this.metadata.configuration.token_endpoint_auth_method=='') {
            this.notes = this.metadata.configuration;
            throw new Error("the claim token_endpoint_auth_method is not present");
        } 

        this.notes = this.metadata.configuration.token_endpoint_auth_method;
        return true;

    }

}

module.exports = Test_1_3_20