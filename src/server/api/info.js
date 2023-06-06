const fs = require("fs-extra");
const Utility = require("../lib/utils");
const config_dir = require("../../config/dir.json");

module.exports = function(app, checkAuthorisation) {

    // get info from session
    app.get("/api/info", function(req, res) {
        
        // check if apikey is correct
        if(!checkAuthorisation(req)) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }		
    
        if(req.session!=null) {
            let info = {
                user: req.session.user,
                store_type: req.session.store_type,
                metadata: req.session.store.metadata,
                request: req.session.authrequest
            }
            res.status(200).send(info);
    
        } else {
            res.status(400).send("Session not found");
        }
    });
}