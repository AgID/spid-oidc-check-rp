const moment = require('moment');

class Test {

    constructor() {
        this._headers = [];
    }

    exec() {
        if(!this.hook) throw new Error("Test must have a hook");
        if(!this.num) throw new Error("Test must have a num");
        if(!this.description) throw new Error("Test must have a description");
        if(!this.validation) throw new Error("Test must have a validation");
        if(!(['automatic','self','required'].includes(this.validation))) throw new Error("Test must have a validation");
        if(!this.exec) throw new Error("Test must have a exec method");
    }

    setSuccess() { this.result = "success"; return this.result; }
    setWarning() { this.result = "warning"; return this.result; }
    setFailure() { this.result = "failure"; return this.result; }

    setHeader(key, value) { this._headers[key] = value; }
    getHeader(key) { return this._headers[key]; }
    getHeaders() { return this._headers; }

    async getResult() {
        let test = {
            num: this.num,
            hook: this.hook,
            description: this.description,
            validation: this.validation,
            result: this.setFailure(),
            message: "",
            notes: "",
            datetime: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        try {
            await this.exec();

            if(this.validation=='self') {
                test.result = this.setWarning();
                test.message = "REQUIRES SELF ASSESSMENT";
                test.notes = this.notes;
            } 
    
            else if(this.validation=='required') {
                test.result = this.setWarning();
                test.message = "REQUIRES AUTHORITY ASSESSMENT";
                test.notes = this.notes;
            } 

            else {
                test.result = this.setSuccess();
                test.message = "SUCCESS";
            }

        } catch(error) {
            test.result = this.setFailure();
            test.message = error;
            
        } finally {
            test.notes = this.notes;
        }

        return test;
    }
}

module.exports = Test 