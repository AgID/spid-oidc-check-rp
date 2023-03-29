const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_8 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.8";
        this.description = "The metadata MUST contain the claim client_name";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(
            (this.metadata.configuration.client_name==null || this.metadata.configuration.client_name=='')
         ) {
            this.notes = this.metadata.configuration;
            throw("the claim client_name is not present");
        } 

        return true;

    }

}

module.exports = Test_1_3_8