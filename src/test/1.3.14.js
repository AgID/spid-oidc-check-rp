const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_14 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.14";
        this.description = "The claim grant types MUST contain the value 'authorization_code'";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.grant_types==null
            || this.metadata.configuration.grant_types=='') {
            this.notes = this.metadata.configuration;
            throw("the claim grant_types is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.grant_types)) {
            this.notes = this.metadata.configuration.grant_types;
            throw("the claim grant_types is not an array");
        }

        if(!this.metadata.configuration.grant_types.includes('authorization_code')) {
            this.notes = this.metadata.configuration.grant_types;
            throw("the claim grant_types does not contain 'authorization_code'");
        }

        this.notes = this.metadata.configuration.grant_types;
        return true;

    }

}

module.exports = Test_1_3_14