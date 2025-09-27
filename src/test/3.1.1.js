const TestTokenResponse = require('../server/lib/test/TestTokenResponse.js');
const Utility = require('../server/lib/utils.js');
const moment = require('../server/node_modules/moment');
const jwt_decode = require('../server/node_modules/jwt-decode');
const oidcTokenHash  = require('../server/node_modules/oidc-token-hash');
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const jose = require('../server/node_modules/node-jose');
const config_op  = require('../config/op.json');

class Test_3_1_1 extends TestTokenResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest) {
        super(metadata, authrequest, authresponse, tokenrequest);
        this.num = "3.1.1";
        this.description = "correct token response for AA containing Grant Token";
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

        let id_token_jti = Utility.getUUID();

        let grant_token = await this.makeGrantToken(
            null,
            null,
            "https://validator.spid.gov.it/aa",
            "oidc:" + id_token_jti,
            "https://www.spid.gov.it/SpidL2",
            config_op.issuer,
            "sub",
            this.metadata.configuration.client_id
        );

        // make ID Token        
        let id_token = await Utility.makeJWS(
            {}, 
            { 
                jti: id_token_jti,
                iss: config_op.issuer,
                sub: 'SUBJECT',
                aud: client_id,
                acr: "https://www.spid.gov.it/SpidL2",
                at_hash: oidcTokenHash.generate(access_token, 'RS256'),
                client_id: client_id,
                iat: iat.unix(),
                nbf: iat.unix(),
                exp: iat.clone().add(5, 'm').unix(),
                nonce: this.authrequest.nonce,
                tokens: [
                    {
                        type: "https://spid.gov.it/attribute-authority/grant-token",
                        aud: "https://as.aa1.it",
                        token: grant_token
                    },
                    {
                        type: "https://spid.gov.it/attribute-authority/grant-token",
                        aud: "https://as.aa2.it",
                        token: grant_token
                    }
                ]
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


    // Grant Token, prima firmato e po crittato
    async makeGrantToken(header, payload, aud, sid, acr, iss, sub, actsub) {
        const config_prv_key = fs.readFileSync(path.resolve(__dirname, '../config/spid-oidc-check-rp-sig.key'));
        const config_pub_key = fs.readFileSync(path.resolve(__dirname, '../config/spid-oidc-check-rp-enc.crt'));
        const keystore = jose.JWK.createKeyStore();
        
        const prv_key = await keystore.add(config_prv_key, 'pem');
        const pub_key = await keystore.add(config_pub_key, 'pem');

        let kid = crypto.randomUUID();
        let iat = moment();
        let exp = iat.clone().add(1, 'years')

        header = {
            typ: (header!=null && header.typ!=null) ? header.typ : "aa-grant+jwt",
            alg: (header!=null && header.alg!=null) ? header.alg : undefined,
            enc: (header!=null && header.enc!=null) ? header.enc : undefined,
            kid: (header!=null && header.kid!=null) ? header.kid : kid
        }

        payload = JSON.stringify({
            iat: (payload!=null && payload.iat!=null) ? payload.iat===false? undefined : payload.iat : iat.unix(),
            exp: (payload!=null && payload.exp!=null) ? payload.exp===false? undefined : payload.exp : exp.unix(),
            nbf: (payload!=null && payload.nbf!=null) ? payload.nbf===false? undefined : payload.nbf : iat.unix(),
            jti: (payload!=null && payload.jti!=null) ? payload.jti===false? undefined : payload.jti : kid,
            aud: (payload!=null && payload.aud!=null) ? payload.aud===false? undefined : payload.aud : aud,
            sid: (payload!=null && payload.sid!=null) ? payload.sid===false? undefined : payload.sid : sid,
            acr: (payload!=null && payload.acr!=null) ? payload.acr===false? undefined : payload.acr : acr,
            iss: (payload!=null && payload.iss!=null) ? payload.iss===false? undefined : payload.iss : iss,
            sub: (payload!=null && payload.sub!=null) ? payload.sub===false? undefined : payload.sub : sub,
            act: (payload!=null && payload.act!=null) ? payload.act===false? undefined : payload.act : {"sub": actsub},
            userID: (payload!=null && payload.userID!=null) ? payload.userID : sub
        })

        const signedGrantToken = await jose.JWS.createSign({
            format: 'compact',
            alg: header.alg ?? 'RS256',
            fields: {...header}
        }, prv_key).update(payload).final();

        console.log("GrantToken JWS (" + aud + ") : ", signedGrantToken);

        const encryptedToken = await jose.JWE.createEncrypt({ 
            format: 'compact',
            fields: {...header} 
        }, pub_key).update(signedGrantToken).final();

        return encryptedToken;
    }    
 
}

module.exports = Test_3_1_1