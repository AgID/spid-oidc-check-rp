const p = require("./package.json");
const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require("fs-extra");
const moment = require("moment");

const config_server = require("../config/server.json");
const config_op = require("../config/op.json");
const config_op_demo = require("../config/op_demo.json");
const config_api = require("../config/api.json");

const Database = require("./lib/database");
const Authenticator = require("./lib/authenticator");
const Utility = require("./lib/utils");

const os = require('os');

const useProxy = config_server.useProxy;
const useHttps = config_server.useHttps;
const httpPort = (process.env.NODE_HTTPS_PORT) ? process.env.NODE_HTTPS_PORT : config_server.port;

let https;
let httpsPrivateKey;
let httpsCertificate;
let httpsCredentials;

if (useHttps) {
    https = require('https');
    httpsPrivateKey  = fs.readFileSync(config_server.httpsPrivateKey, 'utf8');
    httpsCertificate = fs.readFileSync(config_server.httpsCertificate, 'utf8');
    httpsCredentials = {key: httpsPrivateKey, cert: httpsCertificate};
}

var app = express();
app.use(helmet());

app.use((req, res, next)=> {
    console.log(".\n.\n.");
    Utility.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - " + req.method + " [" + req.ips.join(' - ') + "] " + req.path);
    next();
});


app.get("/", function (req, res, next) { 
    if(useProxy || !config_server.basepath) {
        console.log('root base path');
        return next();
    }
    
    let url = config_server.host;
    url += (!useProxy && httpPort)? ':' + httpPort : '';
    url += '/';
    res.redirect(url);
});

app.use(bodyParser.json({limit: '3mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '3mb', extended: true}));
app.use(express.static(path.resolve(__dirname, "..", "client/build")));

app.set('trust proxy', 1);
app.use(session({
    name: 'connect-spid-oidc-check-rp.sid',
    secret: "OIDC CHECK RP",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config_server.useHttps? true : false,
        maxAge: 60*60000 
    }  //30*60000: 30min
}));


// create database
var database = new Database().connect().setup();

// create authenticator
var authenticator = config_op.agidloginAuthentication? new Authenticator("validator") : null;


// Private Funcs
var checkAuth = function(req) {
    // 'API' if checkBasicAuth = true
    // true if checkSessionAuth = true
    // else false
    return checkBasicAuth(req) || checkSessionAuth(req);
}

var checkSessionAuth = function(req) {
    let authorised = false;
    let apikey = req.query.apikey;
    if(apikey!=null && apikey == req.session.apikey) {
        authorised = true;
    } else {
        Utility.log("Authorisation", "ERROR check authorisation : " + apikey);
        authorised = false;
    }
    return authorised;
}

var checkBasicAuth = function(req) {
    let authorised = false;
    if(req.headers.authorization
        && req.headers.authorization.substr(0,5)=="Basic") {
        let authorization = req.headers.authorization.substr(6);
        let authorization_buffer = new Buffer(authorization, 'base64');
        let authorization_plain = authorization_buffer.toString('ascii');
        let user = authorization_plain.split(":")[0];
        let pass = authorization_plain.split(":")[1];
        if(config_api[user]==pass) authorised = 'API';
        Utility.log("Authorisation API", authorization_plain);
    }
    return authorised;
}

/* Authentication */
require('./app/auth')		    (app, checkAuth, authenticator);

/* OIDC Provider Validator */
if(config_op.enabled) require('./app/op') (app, checkAuth, database);

/* OIDC Provider Demo */
//if(config_op_demo.enabled) require('./app/op_demo') (app, checkAuth, database);

/* API Validator */
require('./api/test')    	    (app, checkAuth);
require('./api/metadata')	    (app, checkAuth, database);
require('./api/oidc')	        (app, checkAuth, database);
require('./api/store')		    (app, checkAuth, database);
require('./api/info')		    (app, checkAuth);
require('./api/server-info')	(app);




// routes all to React Router
app.get('*', (req, res)=> {
    console.log("Route to front-end");
    res.sendFile(path.resolve(__dirname + '/../client/build/index.html'));    
});


// start
if(useHttps) app = https.createServer(httpsCredentials, app);

app.listen(httpPort, () => {
    console.log("\n" + p.name + "\nversion: " + p.version);
    console.log("\n\nlistening on port " + httpPort);
});
