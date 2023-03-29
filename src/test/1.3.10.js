const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_10 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.10";
        this.description = "The claim response_types MUST be an array";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.response_types==null
            || this.metadata.configuration.response_types=='') {
            this.notes = this.metadata.configuration;
            throw("the claim response_types is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.response_types)) {
            this.notes = this.metadata.configuration.response_types;
            throw("the claim response_types is not an array");
        }

        this.notes = this.metadata.configuration.response_types;
        return true;

    }

}

module.exports = Test_1_3_10