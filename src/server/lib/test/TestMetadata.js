const Test = require('./Test.js');
const moment = require('moment');

class TestMetadata extends Test {

    constructor(metadata) {
        super();
        this.hook = "metadata";
        this.metadata = metadata;
    }

    exec() {
        super.exec();
    }

    async printResult() {
        let result = this.setFailure();
        try {
            result = this.setSuccess();
            console.log("Test " + this.num + " - Description: " + this.description);
            this.exec();
            console.log("Test " + this.num + " - Notes: " + this.notes);
        } catch(error) {
            result = this.setFailure();
            console.log("Test " + this.num + " - ERROR: " + error.toString());
        } finally {
            console.log("Test " + this.num + " - Result: " + (result? "Success" : "FAIL"));
        }
    }
}

module.exports = TestMetadata 