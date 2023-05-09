const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_8 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.8";
        this.description = "The document MUST contain the claim iat";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let jwt = jwt_decode(this.metadata.entity_statement);

        if (jwt.iat == null || jwt.iat == '')
          throw new Error('claim iat is not present');

        this.notes = jwt.iat;

        return true;
    }

}

module.exports = Test_1_2_8