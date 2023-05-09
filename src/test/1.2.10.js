const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_10 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.10";
        this.description = "The document MUST contain the claim exp";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let jwt = jwt_decode(this.metadata.entity_statement);

        if (jwt.exp == null || jwt.exp == '')
          throw new Error('claim exp is not present');

        this.notes = jwt.exp;

        return true;
    }

}

module.exports = Test_1_2_10
