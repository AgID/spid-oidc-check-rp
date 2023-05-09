const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');
const moment = require('../server/node_modules/moment');


class Test_1_2_9 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.9";
        this.description = "The value of the claim iat MUST be a valid unix timestamp";
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

        if (!moment.unix(jwt.iat).isValid())
            throw new Error('the value of iat is not a valid unix time');

        this.notes = jwt.iat;

        return true;
    }

}

module.exports = Test_1_2_9