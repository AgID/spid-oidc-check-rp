const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_4 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.4";
        this.description = "The claim redirect_uris MUST be an array";
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

        this.notes = this.metadata.configuration.redirect_uris;
        return true;

    }

}

module.exports = Test_1_3_4