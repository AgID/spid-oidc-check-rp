const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_12 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.12";
        this.description = "The metadata MUST contain the claim grant_types";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(
            (this.metadata.configuration.grant_types==null || this.metadata.configuration.grant_types=='')
         ) {
            this.notes = this.metadata.configuration;
            throw new Error("the claim grant_types is not present");
        } 

        this.notes = this.metadata.configuration.grant_types;

        return true;

    }

}

module.exports = Test_1_3_12