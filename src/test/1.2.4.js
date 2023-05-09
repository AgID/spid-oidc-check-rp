const TestMetadata = require('../server/lib/test/TestMetadata.js');

const jwt_decode = require('../server/node_modules/jwt-decode');
const validator = require('../server/node_modules/validator');
const axios = require('../server/node_modules/axios');
const jose = require('../server/node_modules/node-jose');


class Test_1_2_4 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.2.4";
        this.description = "The signature of the JWS document MUST be valid";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        if(this.metadata.type!='federation') {
            this.notes = "N/A (document is not provided as openid-federation)";
            return true;
        }
        
        let returnedDocument = this.metadata.entity_statement;
        
        if (!validator.isJWT(returnedDocument)) {
            this.notes = returnedDocument;
            throw new Error('returned document is not a valid JWT');
        }
    
        let jwks = (await axios.get(this.metadata.configuration.jwks_uri)).data;
    
        if (jwks.keys == null || jwks.keys == '') {
            this.notes = jwks;
            throw new Error('JWKS not found');
        }
    
        let keystore = jose.JWK.createKeyStore();
        for (let k in jwks.keys) {
            await keystore.add(jwks.keys[k]);
        }
    
        let returnedDocumentVerified = await jose.JWS.createVerify(keystore).verify(
            returnedDocument
        );

        this.notes = returnedDocument;

        if (!returnedDocumentVerified) {
            throw new Error('document not verifiable');
        }
    }

}

module.exports = Test_1_2_4