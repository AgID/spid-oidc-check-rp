const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_1 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.1";
        this.description = "The value of claim client_id MUST be a valid https URL with no query or fragment";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(!this.metadata.configuration.client_id.toLowerCase().includes('https')) {
            this.notes = this.metadata.configuration.client_id;
            throw new Error("claim client_id is not a valid https URL");
        } 

        if(this.metadata.configuration.client_id.toLowerCase().includes('?')) {
            this.notes = this.metadata.configuration.client_id;
            throw new Error("claim client_id contains query");
        } 

        if(this.metadata.configuration.client_id.toLowerCase().includes('#')) {
            this.notes = this.metadata.configuration.client_id;
            throw new Error("claim client_id contains fragment");
        } 
            
        this.notes = this.metadata.configuration.client_id;
        return true;

    }

}

module.exports = Test_1_3_1