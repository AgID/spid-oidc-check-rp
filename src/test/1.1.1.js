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
        let response = await axios.get(this.metadata.url);
        if(!validator.isJSON(JSON.stringify(response.data))) {
            throw("The document is not a valid JSON document");
        } else {
            return true;
        }
    }

}

module.exports = Test_1_1_1