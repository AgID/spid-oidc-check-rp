const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.0";
        this.description = "The metadata MUST contain the claim client_id";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        if(this.metadata.configuration.client_id==null
            || this.metadata.configuration.client_id=='') {
            this.notes = this.metadata.configuration.client_id;
            throw("claim client_id is not present");
        } else {
            this.notes = this.metadata.configuration.client_id;
            return true;
        }
    }

}

module.exports = Test_1_3_0