const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_7 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.7";
        this.description = "The value of claim sub MUST be equal to the value of claim iss";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let jwt = jwt_decode(this.metadata.entity_statement);

        if (jwt.iss == null || jwt.iss == '')
          throw new Error('claim iss is not present');

        if (jwt.sub == null || jwt.sub == '')
          throw new Error('claim sub is not present');
    
        if (jwt.sub!=jwt.iss) {
            this.notes = 'sub: ' + jwt.sub + ' != iss: ' + jwt.iss
            throw new Error('the value of claim sub is not equal to the value of claim iss');
        }

        this.notes = jwt.sub;

        return true;
    }

}

module.exports = Test_1_2_7