const TestTokenResponse = require('../server/lib/test/TestTokenResponse.js');
const Utility = require('../server/lib/utils.js');
const moment = require('../server/node_modules/moment');
const jwt_decode = require('../server/node_modules/jwt-decode');
const oidcTokenHash  = require('../server/node_modules/oidc-token-hash');
const config_op  = require('../config/op.json');

class Test_3_1_0 extends TestTokenResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest) {
        super(metadata, authrequest, authresponse, tokenrequest);
        this.num = "3.1.0";
        this.description = "correct token response";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();

        this.setHeader('Cache-Control', 'no-store');
        this.setHeader('Pragma', 'no-cache');
        
        // get data from token request
        let client_id = this.tokenrequest.client_id;
        let client_assertion = jwt_decode(this.tokenrequest.client_assertion);
        let client_assertion_type = this.tokenrequest.client_assertion_type;
        let code = this.tokenrequest.code;
        let code_verifier = this.tokenrequest.code_verifier;
        let grant_type = this.tokenrequest.grant_type;
        let refresh_token = this.tokenrequest.refresh_token;
        let scope = this.tokenrequest.scope; // scope of the access token            
        
        // check of client_assertion is on #3.0.5, #3.0.6, #3.0.7
        // check of code verifier is on  #3.0.28, #3.0.29
        
        let request = this.database.getRequestByCode(code);

        let iat = moment();

        // make Access Token
        let access_token = await Utility.makeJWS(
            {
                typ: "at+jwt"
            }, 
            { 
                jti: Utility.getUUID(),
                iss: config_op.issuer,
                sub: 'SUBJECT',
                aud: client_id,
                client_id: client_id,
                scope: this.authrequest.scope,
                iat: iat.unix(),
                nbf: iat.unix(),
                exp: iat.clone().add(15, 'm').unix()
            },
            'RS256'
        );

        this.database.saveAccessToken(request['req_id'], access_token);

        // make ID Token        
        let id_token = await Utility.makeJWS(
            {}, 
            { 
                jti: Utility.getUUID(),
                iss: config_op.issuer,
                sub: 'SUBJECT',
                aud: client_id,
                acr: "https://www.spid.gov.it/SpidL2",
                at_hash: oidcTokenHash.generate(access_token, 'RS256'),
                client_id: client_id,
                iat: iat.unix(),
                nbf: iat.unix(),
                exp: iat.clone().add(5, 'm').unix(),
                nonce: this.authrequest.nonce
            }
        );

        this.database.saveIdToken(request['req_id'], id_token);

        this.tokenresponse = {
            access_token: access_token,
            token_type: "Bearer",
            expires_in: "60",
            id_token: id_token
        }

        this.notes = this.tokenresponse; 

        return true;
    }
 
}

module.exports = Test_3_1_0