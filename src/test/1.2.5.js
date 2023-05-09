const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_5 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.5";
        this.description = "The document MUST contain the claim iss";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        this.notes = jwt_decode(this.metadata.entity_statement).iss;
        if (this.notes == null || this.notes == '')
          throw new Error('claim iss is not present');
    
        return true;
    }

}

module.exports = Test_1_2_5