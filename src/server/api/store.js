const fs = require("fs-extra");
const Utility = require("../lib/utils");
const config_dir = require("../../config/dir.json");

module.exports = function(app, checkAuthorisation, database) {

    // list all workspace for user and, maybe, requested store type
    //this not saves store to session, use GET /api/store to recover a store instead
    app.get("/api/stores", function(req, res) {  
        
        // check if apikey is correct
        if(!checkAuthorisation(req)) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        let user = req.session.user;

        if(user!=null) {     
            let requested_store = req.query.store_type;
            let available_store = ['test', 'prod'];
            let query_store = available_store.join(', ');
            if(available_store.includes(requested_store)) query_store = requested_store; 
            let stores = database.getStore(user, query_store); 
            if(!stores) stores = [];
            if(!Array.isArray(stores)) stores = [stores];
            res.status(200).send(stores);
    
        } else {
            res.status(401).send("Session not found");
        }
    });

    // recover workspace from store cache
    // this RECOVER store from cache and SAVE it to session
    app.get("/api/store", function(req, res) {
    
        // check if apikey is correct
        if(!checkAuthorisation(req)) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	
 
        let user = req.session.user;
        let store_type = (req.query.store_type!=null && req.query.store_type!='')? req.query.store_type : 'test';

        if(user) {
            let store = database.getStore(req.session.user, store_type);
            Utility.log("SELECT STORE - Type: " + store_type, store);

            // if store not exists, create a test store
            if(!store) {
                store = {
                    metadata: {
                        url: null,
                        configuration: null
                    },
                    test: {}
                };
                database.saveStore(user, null, null, null, 'test', store);
            }

            req.session.store = store;
            res.status(200).send(store);
    
        } else {
            res.status(401).send("Session not found");
        }
    });

    // save workspace to store cache 
    app.post("/api/store", function(req, res) {
    
        // check if apikey is correct
        if(!checkAuthorisation(req)) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        let user = req.session.user;
    
        if(user) {
            let organization = (req.session.entity!=null)? req.session.entity.id : null;
            let store_type = (req.session && req.session.metadata && req.session.metadata.store_type)? req.session.metadata.store_type : 'main';
            Utility.log("POST STORE - Type", store_type);
            database.saveStore(req.session.user, organization, req.session.request.issuer, req.session.external_code, store_type, req.body);
            res.status(200).send();
    
        } else {
            res.status(401).send("Session not found");
        }
    });

    // delete workspace from store cache
    app.delete("/api/store", function(req, res) {
    
        // check if apikey is correct
        if(!checkAuthorisation(req)) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }	

        let user = req.session.user;
    
        if(user) {
            let store_type = (req.query.store_type!=null && req.query.store_type!='')? req.query.store_type : 'test';
            Utility.log("DELETE STORE - Type", store_type);
            database.deleteStore(user, store_type);
            res.status(200).send();
    
        } else {
            res.status(401).send("Session not found");
        }
    });
}