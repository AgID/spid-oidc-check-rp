const TestUserinfoResponse = require('../server/lib/test/TestUserinfoResponse.js');
const Utility = require('../server/lib/utils.js');
const moment = require('../server/node_modules/moment');
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

        let iat = moment();
        let client_id = this.authrequest.client_id;

        let userinfo = {
            "sub": "SUBJECT",
            "name": "Mario",
            "family_name": "Rossi",
            "https://attributes.spid.gov.it/fiscalNumber": "MROXXXXXXXXXXXXX"  
        };

        this.userinforesponse = 
            await Utility.makeJWE(
                {
                    typ: "JWT"
                },
                await Utility.makeJWS(
                    {
                        typ: "JWT"
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
                )
            );

        let request = this.database.getRequestByAccessToken(this.userinforequest.access_token);
        this.database.saveUserinfo(request['req_id'], userinfo);

        
        this.notes = userinfo;
        return true;
    }
 
}

module.exports = Test_4_1_0