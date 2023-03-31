const url = require("url");
const path = require("path");
const flatted = require("flatted");
const child_process = require('child_process');
const UUID = require("uuidjs");
const moment = require("moment");
const jose = require("node-jose");
const base64url = require("base64url");
const x509 = require("@peculiar/x509");
const CryptoJS = require("crypto-js");
const validator = require("validator");
const fs = require("fs-extra");


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.normalize = function() {
    var target = this;
    return target.replace(/[^a-z0-9]/gi, "_").toLowerCase().trim();
}

class Utils {

    static log(tag, text) {
        console.log("\n\n>>> " + tag);
        if(text!=null) console.log(flatted.stringify(text));
    }

    static defaultParam(params, key, defaultVal) {
        let val = params.filter((p)=> { return (p.key==key) })[0];
        if(val==null) params.push({"key": key, "val": defaultVal});
        return params;
    }

    static getUUID() {
        // NCName type (https://github.com/italia/spid-saml-check/issues/14)
        return "_" + UUID.generate();
    }

    static getNonce() {
        return UUID.genV4().hexNoDelim;
    }

    static getInstant() {
        return moment().utc().format();
    }

    static getInstantMillis() {
        return moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    static getNotBefore(instant) {
        return moment(instant).utc().format();
    }

    static getNotOnOrAfter(instant) {
        return moment(instant).add(5, 'm').utc().format();
    }

    static encrypt(toencrypt, key) {
        return CryptoJS.AES.encrypt(toencrypt, key);
    }
        
    static decrypt(encrypted, key) {
        return CryptoJS.AES.decrypt(encrypted.toString(), key);
    }

    static btoa(text) {
        return Buffer.from(text).toString('base64');
    }

    static atob(buffer) {
        return Buffer.from(buffer, 'base64').toString('ascii');
    }

    // patch to validator.isJWT for JWE compatibility
    // move to validator.isJWT when PR will be merged 
    // https://github.com/validatorjs/validator.js/pull/2031
    static isJWT(str, jwe = false) {
        let dotSplit = str.split('.');
        let len = dotSplit.length;
      
        if(!jwe) {
            if (len > 3 || len < 2) {
                return false;
            }
        } else {
            if (len < 5 || len > 5) {
                return false; 
            }
        }
      
        return dotSplit.reduce((acc, currElem) => acc && validator.isBase64(currElem, { urlSafe: true }), true);
    }

    static async makeJWS(header_data, payload_data, alg='RS256') {
        const crt_pem = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-sig.crt'));
        const key_pem = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-sig.key'));
        const x5c = new x509.X509Certificate(crt_pem);

        const keystore = jose.JWK.createKeyStore();

        let key = await keystore.add(key_pem, 'pem');
        let thumbprint = await key.thumbprint('SHA-256');

        let header = {
            kid: base64url.encode(thumbprint),
            x5c: [x5c.toString("base64")],
            ...header_data
        }

        let jws = await jose.JWS.createSign({
            format: 'compact',
            alg: alg,
            fields: {...header}
        }, key).update(JSON.stringify(payload_data)).final();

        return jws;
    }

    static async makeJWE(header_data, payload_data, key) {

        let keys;
        const keystore = jose.JWK.createKeyStore();
        
        if(!key) {
            const key_pem = fs.readFileSync(path.resolve(__dirname, '../../config/spid-oidc-check-rp-enc.key'));
            keys = await keystore.add(key_pem, 'pem');                
        } else {
            keys = await keystore.add(key);            
        }
        

        let thumbprint = await keys.thumbprint('SHA-256');

        let header = {
            kid: base64url.encode(thumbprint),
            ...header_data
        }

        let jwe = await jose.JWE.createEncrypt({
            format: 'compact',
            fields: {...header}
        }, keys).update(payload_data).final();

        return jwe;
    }
}

module.exports = Utils;
