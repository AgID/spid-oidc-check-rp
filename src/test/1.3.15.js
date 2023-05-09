const TestMetadata = require('../server/lib/test/TestMetadata.js');

class Test_1_3_15 extends TestMetadata {

    constructor(metadata) {
        super(metadata);
        this.num = "1.3.15";
        this.description = "The claim grant types MUST contain the value 'authorization_code'";
        this.validation = "automatic";
    }

    async exec() {
        super.exec();
        
        if(this.metadata.configuration.grant_types==null
            || this.metadata.configuration.grant_types=='') {
            this.notes = this.metadata.configuration;
            throw new Error("the claim grant_types is not present");
        } 

        if(!Array.isArray(this.metadata.configuration.grant_types)) {
            this.notes = this.metadata.configuration.grant_types;
            throw new Error("the claim grant_types is not an array");
        }

        for(let i in this.metadata.configuration.grant_types) {
            let value = this.metadata.configuration.grant_types[i];
            let allowed_values = ['authorization_code', 'refresh_token'];
            if(!allowed_values.includes(value)) {
                this.notes = this.metadata.configuration.grant_types;
                throw new Error("the value " + value + " is not one of allowed values " + JSON.stringify(allowed_values));
            }
        }

        this.notes = this.metadata.configuration.grant_types;
        return true;

    }

}

module.exports = Test_1_3_15