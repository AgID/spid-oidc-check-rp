const fs = require("fs-extra");
const path = require('path');
const sha256 = require("sha256");
const moment = require("moment"); 
const Utility = require("../lib/utils");
const config_op = require("../../config/op.json");


module.exports = function(app, checkAuthorisation, authenticator) {

    // local authentication
    app.get("//login", (req, res)=> {
        
        if(config_op.agidloginAuthentication) {
            res.redirect(authenticator.getAuthURL());
    
        } else {
            let user		= req.query.user;
            let password	= req.query.password;
            
            if((user==config_op.localloginUser && password==config_op.localloginPasswordHash)) {
                let apikey = recLocalLoginSession(req);
                res.status(200).send({ apikey: apikey });
        
            } else {
                error = {code: 401, msg: "Unauthorized"}
                console.log("ERROR /auth/local : " + error.msg + " (" + user + " : " + password + ")");
                res.status(error.code).send(error.msg);
                return null;				
            }
        }
    });

    // assert if local authentication apikey or AgID Login authentication
    app.get("//login/assert", (req, res)=> {

        // if autoLogin autologin with localloginUser
        if(config_op.autoLogin) recLocalLoginSession(req);

        if(req.session!=null && req.session.apikey!=null && req.session.apikey!='') {
            res.status(200).send({
                remote: config_op.agidloginAuthentication,
                apikey: req.session.apikey
            });
        } else {
            error = {code: 401, data: {msg: "Unauthorized", remote: config_op.agidloginAuthentication}};
            res.status(error.code).send(error.data);
            return null;
        }
    });

    // AgID Login authentication
    app.post("/", function(req, res, next) {
        let state = req.body.state;
        authenticator.getUserInfo(req.body, state, (userinfo)=> {
    
            let userpolicy = userinfo.user_policy[0];
            let entity = userpolicy.entity_id;
            let policy = userpolicy.policy;
    
            let now = moment();
            let validfrom = (userpolicy.valid_from)? moment(userpolicy.valid_from) : moment();
            let validto = (userpolicy.valid_to)? moment(userpolicy.valid_to) : moment();
            let fromnow = now.diff(validfrom, 'days');
            let nowto = validto.diff(now, 'days');
    
            console.log("AgID Login USER", userinfo);
    
            req.session.user = userinfo.email;
            let apikey = sha256(userinfo.sub).toString();
            req.session.apikey = apikey;

            res.redirect(config_op.basepath + "/worksave");
    
        }, (error)=> {
            Utility.log("Error", error);
            res.status(500).send(error);
            //res.sendFile(path.resolve(__dirname, "../..", "client/view", "error.html"));
            //res.redirect("/");
        });
    });

    // session logout and AgID Login global logout
    app.get("//logout", (req, res)=> {
        req.session.destroy();
        if(config_op.agidloginAuthentication) {
            res.redirect(authenticator.getLogoutURL());
        } else {
            res.redirect(config_op.basepath);
        }
    });

    // session logout and AgID Login global logout
    app.get("//switch/:user", (req, res)=> {
        // check if apikey is correct
        let authorisation = checkAuthorisation(req);
        if(!authorisation) {
            error = {code: 401, msg: "Unauthorized"};
            res.status(error.code).send(error.msg);
            return null;
        }

        let user = req.params.user;
        req.session.user = user;
        res.redirect(config_op.basepath + "/worksave");
    });
    

    function recLocalLoginSession(req) {
        let user = config_op.localloginUser;
        let passwordHash = config_op.localloginPasswordHash;
        let apikey = sha256(user + passwordHash).toString();	
        console.log("SUCCESS /auth/local : APIKEY " + apikey);
        req.session.user = user;
        req.session.apikey = apikey;
        return apikey;
    }
}