const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_13 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.13";
        this.description = "The claim grant_types MUST be an array";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.grant_types==null
            || this.metadata.configuration.grant_types=='') {
            this.notes = this.metadata.configuration;
            throw new Error("the claim grant_types is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.grant_types)) {
            this.notes = this.metadata.configuration.grant_types;
            throw new Error("the claim grant_types is not an array");
        }

        this.notes = this.metadata.configuration.grant_types;
        return true;

    }

}

module.exports = Test_1_3_13