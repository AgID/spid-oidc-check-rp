const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios');

class Test_1_1_2 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.1.2";
        this.description = "The document MUST be returned as Content-Type application/json ";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        let response = await axios.get(this.metadata.url);
        if(!response.headers['content-type'].includes('application/json')) {
            this.notes = response.headers['content-type'];
            throw("Content-Type is not 'application/json'");
        } else {
            this.notes = response.headers['content-type'];
            return true;
        }
    }

}

module.exports = Test_1_1_2