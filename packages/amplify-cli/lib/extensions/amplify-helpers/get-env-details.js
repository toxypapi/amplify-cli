"use strict";
const fs = require('fs');
const pathManager = require('./path-manager');
const { readJsonFile } = require('./read-json-file');
function getEnvDetails() {
    const envProviderFilePath = pathManager.getProviderInfoFilePath();
    let envProviderInfo = {};
    if (fs.existsSync(envProviderFilePath)) {
        envProviderInfo = readJsonFile(envProviderFilePath);
    }
    return envProviderInfo;
}
module.exports = {
    getEnvDetails,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-env-details.js.map