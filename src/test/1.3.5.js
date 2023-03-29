const TestMetadata = require('../server/lib/test/TestMetadata.js');
const Validator = require('../server/node_modules/validator');

class Test_1_3_5 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.5";
        this.description = "The values in redirect_uris MUST be valid URI";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.redirect_uris==null
            || this.metadata.configuration.redirect_uris=='') {
            this.notes = this.metadata.configuration.redirect_uris;
            throw("the claim redirect_uris is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.redirect_uris)) {
            this.notes = this.metadata.configuration.redirect_uris;
            throw("the claim redirect_uris is not an array");
        }

        this.notes = {};
        let valid = true;

        for(const u in this.metadata.configuration.redirect_uris) {
            let uri = this.metadata.configuration.redirect_uris[u];
            if(!Validator.isURL(uri, {
                protocols: ['https'], 
                require_tld: true, 
                require_protocol: true, 
                require_host: true, 
                require_port: false, 
                allow_underscores: true, 
                host_whitelist: false, 
                host_blacklist: false, 
                allow_trailing_dot: false, 
                allow_fragments: true, 
                allow_query_components: true, 
                disallow_auth: false, 
                validate_length: true   // 2083 characters is IE max URL length
            })) {
                this.notes[uri] = "not valid";
                valid = false;
            } else {
                this.notes[uri] = "valid";
            }
        }

        if(!valid) throw("some redirect_uri is not a valid URI");

        return true;

    }

}

module.exports = Test_1_3_5