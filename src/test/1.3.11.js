const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_11 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.11";
        this.description = "The claim response_types MUST contain only the value 'code'";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.response_types==null
            || this.metadata.configuration.response_types=='') {
            this.notes = this.metadata.configuration;
            throw new Error("the claim response_types is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.response_types)) {
            this.notes = this.metadata.configuration.response_types;
            throw new Error("the claim response_types is not an array");
        }

        if(!(
            this.metadata.configuration.response_types.length==1
            && this.metadata.configuration.response_types.includes('code')
        )) {
            this.notes = this.metadata.configuration.response_types;
            throw new Error("the claim response_types does not contain only the value 'code'");
        }

        this.notes = this.metadata.configuration.response_types;
        return true;

    }

}

module.exports = Test_1_3_11