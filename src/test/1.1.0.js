const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios').default;

class Test_1_1_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.1.0";
        this.description = "The response MUST return HTTP Status Code 200 OK";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.type!='configuration') {
            this.notes = "N/A (document is not provided as openid-configuration)";
            return true;
        }

        let response = await axios.get(this.metadata.url);
        if(response.status!=200) {
            this.notes = response.status;
            throw new Error("The HTTP Status Code is not 200 OK");
        } else {
            return true;
        }
    }

}

module.exports = Test_1_1_0
