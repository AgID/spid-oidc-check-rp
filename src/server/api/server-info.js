const server_package = require("../package.json");

module.exports = function (app) {

    // get server info
    app.get("//api/server-info", function (req, res) {

        if (req.session != null) {
            let serverInfo = {
                package_name: server_package.name,
                package_version: server_package.version,
                package_repository: server_package.repository
            }
            res.status(200).send(serverInfo);

        } else {
            res.status(400).send("Session not found");
        }
    });
}