const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_9 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.9";
        this.description = "The metadata MUST contain the claim response_types";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(
            (this.metadata.configuration.response_types==null || this.metadata.configuration.response_types=='')
         ) {
            this.notes = this.metadata.configuration;
            throw("the claim response_types is not present");
        } 

        return true;

    }

}

module.exports = Test_1_3_9