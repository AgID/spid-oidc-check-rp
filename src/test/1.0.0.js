const TestMetadata = require('../server/lib/test/TestMetadata.js');
const axios = require('../server/node_modules/axios');

class Test_1_0_0 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.0.0";
        this.description = "Metadata file MUST be retrieved from registry.spid.gov.it (DEPRECATED)";
        this.validation = "self";
    }

    async exec() {
        super.exec();

        if(!this.metadata.url.startsWith('https://registry.spid.gov.it')) {
            this.notes = this.metadata.url;
            throw new Error("Metadata file is not retrieved from registry.spid.gov.it");

        } else {
            return true;
        }
    }

}

module.exports = Test_1_0_0