import axios from "axios";
import Utility from "./utility";
import config from "./config.json";


class MainService {

	constructor() {
		this.mainService = null;
		Utility.log("SERVICES", "CREATED");
	}

	static getMainService() {
		if(this.mainService==null) 
			this.mainService = new MainService()

		return this.mainService;
	}

	login(options, callback_response, callback_error) {
		Utility.log("GET /login");
		axios.get(config.basepath + 'login?user=' + options.user + '&password=' + options.password)
		.then((response)=> {
			callback_response(response.data.apikey);
		})
		.catch((error)=> {  
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}	

	assert(callback_response, callback_error) {
		Utility.log("GET /login/assert");
		axios.get(config.basepath + 'login/assert')
		.then((response)=> {
			callback_response(response.data);
		})
		.catch((error)=> {
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	/*
	startPing() {
		Utility.log("START PING");
		setInterval(()=>this.ping(), 3000);
	}

	ping() {
		Utility.log("GET /ping");
		axios.get(config.basepath + '/ping?apikey=' + Utility.getApikey())
		.catch(function (error) {
			window.location="/#/login";
		});
	}
	*/

	getInfo(callback_response, callback_nosession, callback_error) {
		Utility.log("GET /api/info");
		axios.get(config.basepath + 'api/info?apikey=' + Utility.getApikey())
		.then(function(response) {
			Utility.log("getInfo Success", response.data);
			if(response.data.metadata.configuration && response.data.request) {
				callback_response(response.data);
			} else {
				callback_nosession(response.data);
			}
		})
		.catch(function(error) {
			Utility.log("getInfo Error", error);
			callback_error((error!=null) ? error : "Service not available");
		});
    }

	loadAllWorkspace(callback_response, callback_nosession, callback_error) {
		Utility.log("GET /api/stores?apikey=" + Utility.getApikey());
		axios.get(config.basepath + 'api/stores?apikey=' + Utility.getApikey())
		.then(function(response) {
			Utility.log("loadAllWorkspace Success", response.data);
            callback_response(response.data);
		})
		.catch(function(error) {
			console.log(error);
			if(error.response.status==401) {
				callback_nosession((error.response!=null) ? error.response.data : "Session not found");
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}

	loadWorkspace(store_type, callback_response, callback_nosession, callback_error) {
		Utility.log("GET /api/store?store_type=" + store_type + "&apikey=" + Utility.getApikey());
		axios.get(config.basepath + 'api/store?store_type=' + store_type + '&apikey=' + Utility.getApikey())
		.then(function(response) {
			Utility.log("loadWorkspace Success", response.data);
            callback_response(response.data);
		})
		.catch(function(error) {
			if(error.response.status==401) {
				callback_nosession((error.response!=null) ? error.response.data : "Session not found");
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}

	saveWorkspace(data) {
		Utility.log("POST /api/store", data);
		axios.post(config.basepath + 'api/store?apikey=' + Utility.getApikey(), data)
		.then(function(response) {
			Utility.log("saveWorkspace Success", response.data);
		})
		.catch(function(error) {
			Utility.log("saveWorkspace Error", error.response.data);
		});
	}

	resetWorkspace(store_type, callback_response, callback_error) {
		Utility.log("DELETE /api/store?store_type=" + store_type);
		axios.delete(config.basepath + 'api/store?store_type='+store_type+'&apikey=' + Utility.getApikey())
		.then(function(response) {
			Utility.log("resetWorkspace Success", response.data);
			callback_response();
		})
		.catch(function(error) {
			Utility.log("resetWorkspace Error", error.response.data);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	downloadMetadata(url, type, callback_response, callback_error) {
		Utility.log("POST /api/metadata/" + type + "/download");
		axios.post(config.basepath + 'api/metadata/' + type + '/download?apikey=' + Utility.getApikey(), {url: url})
		.then(function(response) {
			Utility.log("downloadMetadata Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("downloadMetadata Error", error.response.data);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	checkMetadata(testcase, callback_response, callback_error) {
		Utility.log("GET /api/metadata/check/" + testcase);
		axios.get(config.basepath + 'api/metadata/check/' + testcase + 
			'?apikey=' + Utility.getApikey(), {timeout: 900000})
		.then(function(response) {
			Utility.log("checkMetadata Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("checkMetadata Error", error);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	getLastCheck(testcase, callback_response, callback_notfound, callback_error) {  
		Utility.log("GET /api/metadata/lastcheck/" + testcase);
		axios.get(config.basepath + 'api/metadata/lastcheck/' + testcase + '?apikey=' + Utility.getApikey(), {timeout: 900000})
		.then(function(response) {
			Utility.log("getLastCheck Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("getLastCheck Error", error);
			if(error.response.status==404) {
				Utility.log("getLastCheck Not Found");
				callback_notfound();
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}

	patchMetadataTest(testcase, test, data, callback_response, callback_notfound, callback_error) {  
		Utility.log("PATCH /api/metadata/" + testcase + "/" + test);
		axios.patch(
			config.basepath + 'api/metadata/' + testcase + '/' + test + '?apikey=' + Utility.getApikey(),
			{data: data},
			{timeout: 900000}
		)
		.then(function(response) {
			Utility.log("patchMetadataTest Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("patchMetadataTest Error", error);
			if(error.response.status==404) {
				Utility.log("patchMetadataTest Not Found");
				callback_notfound();
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}

	patchOIDCTest(testcase, hook, test, data, callback_response, callback_notfound, callback_error) {  
		Utility.log("PATCH /api/oidc/report/" + testcase + "/" + hook + "/" + test);
		axios.patch(
			config.basepath + 'api/oidc/report/' + testcase + '/' + hook + "/" + test + '?apikey=' + Utility.getApikey(),
			{data: data},
			{timeout: 900000}
		)
		.then(function(response) {
			Utility.log("patchOIDCTest Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("patchOIDCTest Error", error);
			if(error.response.status==404) {
				Utility.log("patchOIDCTest Not Found");
				callback_notfound();
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}

	getTestSuite(testsuite, callback_response, callback_error) {
		Utility.log("GET /api/test/suite/" + testsuite);
		axios.get(config.basepath + 'api/test/suite/' + testsuite + '?apikey=' + Utility.getApikey(), {timeout: 900000})
		.then(function(response) {
			Utility.log("getTestSuite Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("getTestSuite Error", error);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	startCheck(testcase, callback_response, callback_error) {
		Utility.log("GET /api/oidc/check/" + testcase);
		axios.get(config.basepath + 'api/oidc/check/' + testcase + '?apikey=' + Utility.getApikey(), {timeout: 900000})
		.then(function(response) {
			Utility.log("startCheck Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("startCheck Error", error);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}

	getReport(callback_response, callback_notfound, callback_error) {  
		Utility.log("GET /api/oidc/report");
		axios.get(config.basepath + 'api/oidc/report' + '?apikey=' + Utility.getApikey(), {timeout: 900000})
		.then(function(response) {
			Utility.log("getReport Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("getReport Error", error);
			if(error.response.status==404) {
				Utility.log("getReport Not Found");
				callback_notfound();
			} else {
				callback_error((error.response!=null) ? error.response.data : "Service not available");
			}
		});
	}
	
	getServerInfo(callback_response, callback_error) {
		Utility.log("GET /api/server-info");
		axios.get(config.basepath + 'api/server-info', {timeout: 900000})
		.then(function(response) {
			Utility.log("getServerInfo Success", response.data);
			callback_response(response.data);
		})
		.catch(function(error) {
			Utility.log("getServerInfo Error", error);
			callback_error((error.response!=null) ? error.response.data : "Service not available");
		});
	}
}

export default MainService;
