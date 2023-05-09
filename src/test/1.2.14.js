const TestMetadata = require('../server/lib/test/TestMetadata.js');
const jwt_decode = require('../server/node_modules/jwt-decode');


class Test_1_2_14 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.14";
        this.description = "The authority_hints MUST contain 'https://registry.spid.gov.it'";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }

        let jwt = jwt_decode(this.metadata.entity_statement);

        if (jwt.authority_hints == null || jwt.authority_hints == '')
          throw new Error('claim authority_hints is not present');

        this.notes = jwt.authority_hints;
          
        if (!jwt.authority_hints.includes('https://registry.spid.gov.it')) 
            throw new Error('the authority_hints not contains https://registry.spid.gov.it');
        

        return true;
    }

}

module.exports = Test_1_2_14
