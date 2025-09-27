const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios').default;
const validator = require('../server/node_modules/validator');

class Test_1_2_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.0";
        this.description = "Document URL MUST be /.well-known/openid-federation";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        this.notes = this.metadata.url;
        
        if(!this.metadata.url.endsWith('/.well-known/openid-federation')) {
            throw new Error("The document URL is not /.well-known/openid-federation");

        } else {
            return true;
        }
    }

}

module.exports = Test_1_2_0
