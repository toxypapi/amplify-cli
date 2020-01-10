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
const ora = require('ora');
const pathManager = require('./path-manager');
const { removeEnvFromCloud } = require('./remove-env-from-cloud');
const { getFrontendPlugins } = require('./get-frontend-plugins');
function deleteProject(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const confirmation = yield getConfirmation(context);
        if (confirmation.proceed) {
            const allEnvs = context.amplify.getEnvDetails();
            const spinner = ora('Deleting resources from the cloud. This may take a few minutes...');
            spinner.start();
            yield Promise.all(Object.keys(allEnvs).map(env => removeEnvFromCloud(context, env, confirmation.deleteS3)));
            spinner.succeed('Project deleted in the cloud');
            // Remove amplify dir
            const { frontend } = context.amplify.getProjectConfig();
            const frontendPlugins = getFrontendPlugins(context);
            const frontendPluginModule = require(frontendPlugins[frontend]);
            frontendPluginModule.deleteConfig(context);
            context.filesystem.remove(pathManager.getAmplifyDirPath());
            context.print.success('Project deleted locally.');
        }
    });
}
function getConfirmation(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.input.options && context.input.options.force)
            return {
                proceed: true,
                deleteS3: true,
            };
        return {
            proceed: yield context.amplify.confirmPrompt.run('Are you sure you want to continue? (This would delete all the environments of the project from the cloud and wipe out all the local amplify resource files)'),
            // Place holder for later selective deletes
            deleteS3: true,
        };
    });
}
module.exports = {
    deleteProject,
    getConfirmation,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/delete-project.js.map