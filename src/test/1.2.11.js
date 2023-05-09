const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');
const moment = require('../server/node_modules/moment');


class Test_1_2_11 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.11";
        this.description = "The value of the claim exp MUST be a valid unix timestamp";
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

        if (!moment.unix(jwt.exp).isValid())
            throw new Error('the value of exp is not a valid unix time');

        this.notes = jwt.exp;

        return true;
    }

}

module.exports = Test_1_2_11