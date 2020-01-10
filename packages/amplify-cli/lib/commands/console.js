"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs-extra');
const open = require('open');
const providerName = 'awscloudformation';
module.exports = {
    name: 'console',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        let consoleUrl = getDefaultURL();
        try {
            const localEnvInfoFilePath = context.amplify.pathManager.getLocalEnvFilePath();
            if (fs.existsSync(localEnvInfoFilePath)) {
                const teamProviderInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath();
                if (fs.existsSync(teamProviderInfoFilePath)) {
                    const localEnvInfo = context.amplify.readJsonFile(localEnvInfoFilePath);
                    const teamProviderInfo = context.amplify.readJsonFile(teamProviderInfoFilePath);
                    const { envName } = localEnvInfo;
                    const { AmplifyAppId } = teamProviderInfo[envName][providerName];
                    if (envName && AmplifyAppId) {
                        consoleUrl = constructStatusURL(AmplifyAppId, envName);
                    }
                }
            }
        }
        catch (e) {
            context.print.error(e.message);
        }
        context.print.green(consoleUrl);
        open(consoleUrl, { wait: false });
    }),
};
function constructStatusURL(appId, envName) {
    const prodURL = `https://console.aws.amazon.com/amplify/home#/${appId}/YmFja2VuZA/${envName}`; // eslint-disable-line
    return prodURL;
}
function getDefaultURL() {
    const prodURL = `https://console.aws.amazon.com/amplify/home#/create`; // eslint-disable-line
    return prodURL;
}
//# sourceMappingURL=../../src/lib/commands/console.js.map