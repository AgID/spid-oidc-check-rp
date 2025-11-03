const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios').default;
const validator = require('../server/node_modules/validator');

class Test_1_2_2 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.2";
        this.description = "The document MUST be returned as a valid JWS document";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let response = await axios.get(this.metadata.url);
        this.notes = response.data;
        
        if(!validator.isJWT(response.data)) {
            throw new Error("The document is not a valid JWT");
        } else {
            return true;
        }
    }

}

module.exports = Test_1_2_2
