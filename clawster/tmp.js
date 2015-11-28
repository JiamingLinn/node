var pathUtil = require("path");
console.log(pathUtil.parse("./dir\\docs.mongoing.com/manual-zh/tutorial/install-mongodb-enterprise-on-debian.html".replace(/\/|\\/g,pathUtil.sep)));