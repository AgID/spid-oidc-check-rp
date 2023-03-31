const TestUserinfoResponse = require('../server/lib/test/TestUserinfoResponse.js');
const Utility = require('../server/lib/utils.js');
const moment = require('../server/node_modules/moment');
const jwt_decode = require('../server/node_modules/jwt-decode');
const config_op  = require('../config/op.json');


class Test_4_1_0 extends TestUserinfoResponse {

    constructor(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse) {
        super(metadata, authrequest, authresponse, tokenrequest, tokenresponse, userinforequest, userinforesponse);
        this.num = "4.1.0";
        this.description = "Correct userinfo response";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        this.setHeader('Content-Type', 'application/jwt');

        // Gli OpenID Provider (OP) devono usare jwks o signed_jwks_uri (Avv. SPID n.41 v.2)
        
        if(!this.metadata.configuration.jwks
            && !this.metadata.configuration.signed_jwks_uri
        ) {
            this.notes = this.metadata.configuration;
            throw("neither jwks or signed_jwks_uri is present into OP metadata");
        }

        let op_jwks = this.metadata.configuration.jwks;

        if(!op_jwks) {
            //let op_signed_jwks = (await axios.get(this.metadata.configuration.signed_jwks_uri)).data;
            this.notes = "signed_jwks_uri is not yet implemented. Please refer to AgID.";
            throw("OP uses signed_jwks_uri");
        }


        // search for enc key
        let key = this.metadata.configuration.jwks.keys.filter((k)=> { return k.use=='enc' })[0];


        // compile sub same as id_token
        let userinfo = {
            "sub": jwt_decode(this.tokenresponse.id_token).sub
        }

        // compile userinfo requested with authrequest
        for(let claim in this.authrequest.claims.userinfo) {
            userinfo[claim] = "TEST - " + claim; 
        }

        let iat = moment();
        let client_id = this.authrequest.client_id;

        let jws = await Utility.makeJWS(
            {
                cty: "JWT"
            }, 
            { 
                "jti": Utility.getUUID(),
                "iss": config_op.issuer,
                "aud": client_id,
                "iat": iat.unix(),
                "nbf": iat.unix(),
                "exp": iat.clone().add(15, 'm').unix(),
                ...userinfo
            },
            'RS256'
        );

        this.userinforesponse = 
            await Utility.makeJWE(
                {
                    cty: "JWT"
                },
                jws,
                key
            );

        let request = this.database.getRequestByAccessToken(this.userinforequest.access_token);
        this.database.saveUserinfo(request['req_id'], userinfo);

        
        this.notes = userinfo;
        return true;
    }
 
}

module.exports = Test_4_1_0