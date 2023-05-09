const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_12 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.12";
        this.description = "The document MUST contain the claim jwks";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let jwt = jwt_decode(this.metadata.entity_statement);

        if (jwt.jwks == null || jwt.jwks == '')
          throw new Error('claim jwks is not present');

        this.notes = jwt.jwks;

        return true;
    }

}

module.exports = Test_1_2_12
