const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_3 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.3";
        this.description = "The metadata MUST contain the claim redirect_uris";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.redirect_uris==null
            || this.metadata.configuration.redirect_uris=='') {
            this.notes = this.metadata.configuration.redirect_uris;
            throw new Error("the claim redirect_uris is not present");
        } 

        this.notes = this.metadata.configuration.redirect_uris;
        return true;

    }

}

module.exports = Test_1_3_3