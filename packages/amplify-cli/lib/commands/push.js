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
const sequential = require('promise-sequential');
const ora = require('ora');
const { readJsonFile } = require('../extensions/amplify-helpers/read-json-file');
const spinner = ora('');
const { getProviderPlugins } = require('../extensions/amplify-helpers/get-provider-plugins');
module.exports = {
    name: 'push',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            context.amplify.constructExeInfo(context);
            yield syncCurrentCloudBackend(context);
            return yield context.amplify.pushResources(context);
        }
        catch (e) {
            if (e.name !== 'InvalidDirectiveError') {
                context.print.error(`An error occured during the push operation: ${e.message}`);
            }
            process.exit(1);
        }
    }),
};
// The following code pulls the latest backend to #current-cloud-backend
// so the amplify status is correctly shown to the user before the user confirms
// to push his local developments
function syncCurrentCloudBackend(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.exeInfo.restoreBackend = false;
        const currentEnv = context.exeInfo.localEnvInfo.envName;
        try {
            const { projectPath } = context.exeInfo.localEnvInfo;
            const providerInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath(projectPath);
            const amplifyMeta = {};
            amplifyMeta.providers = readJsonFile(providerInfoFilePath)[currentEnv];
            const providerPlugins = getProviderPlugins(context);
            const pullCurrentCloudTasks = [];
            context.exeInfo.projectConfig.providers.forEach(provider => {
                const providerModule = require(providerPlugins[provider]);
                pullCurrentCloudTasks.push(() => providerModule.initEnv(context, amplifyMeta.providers[provider]));
            });
            spinner.start(`Fetching updates to backend environment: ${currentEnv} from the cloud.`);
            yield sequential(pullCurrentCloudTasks);
            spinner.succeed(`Successfully pulled backend environment ${currentEnv} from the cloud.`);
        }
        catch (e) {
            spinner.fail(`There was an error pulling the backend environment ${currentEnv}.`);
            throw e;
        }
    });
}
//# sourceMappingURL=../../src/lib/commands/push.js.map