const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios');
const validator = require('../server/node_modules/validator');

class Test_1_1_1 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.1.1";
        this.description = "The document MUST be returned as a valid JSON document";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.type!='configuration') {
            this.notes = "N/A (document is not provided as openid-configuration)";
            return true;
        }

        let response = await axios.get(this.metadata.url);
        if(!validator.isJSON(JSON.stringify(response.data))) {
            throw new Error("The document is not a valid JSON document");
        } else {
            return true;
        }
    }

}

module.exports = Test_1_1_1