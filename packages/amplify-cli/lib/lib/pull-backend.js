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
const { initializeEnv } = require('./initialize-env');
const { postPullCodeGenCheck } = require('./amplify-service-helper');
function pullBackend(context, inputParams) {
    return __awaiter(this, void 0, void 0, function* () {
        context.exeInfo = context.amplify.getProjectDetails();
        context.exeInfo.inputParams = inputParams;
        context.print.info('');
        context.print.info('Pre-pull status:');
        const hasChanges = yield context.amplify.showResourceTable();
        context.print.info('');
        context.exeInfo.forcePush = false;
        context.exeInfo.restoreBackend = !context.exeInfo.inputParams.amplify.noOverride;
        if (hasChanges && context.exeInfo.restoreBackend) {
            context.print.warning('Local changes detected.');
            context.print.warning('Pulling changes from the cloud will override your local changes.');
            if (!context.exeInfo.inputParams.yes) {
                const confirmOverride = yield context.amplify.confirmPrompt.run('Are you sure you would like to continue?', false);
                if (!confirmOverride) {
                    context.print.info(`Run an 'amplify push' to update your project upstream.`);
                    context.print.info('However, this will override upstream changes to this backend environment with your local changes.');
                    context.print.info(`To merge local and upstream changes, commit all backend code changes to Git, perform a merge, resolve conflicts, and then run 'amplify push'.`);
                    process.exit(0);
                }
            }
        }
        yield initializeEnv(context);
        ensureBackendConfigFile(context);
        yield postPullCodeGenCheck(context);
        context.print.info('Post-pull status:');
        yield context.amplify.showResourceTable();
        context.print.info('');
    });
}
function ensureBackendConfigFile(context) {
    const { projectPath } = context.exeInfo.localEnvInfo;
    const backendConfigFilePath = context.amplify.pathManager.getBackendConfigFilePath(projectPath);
    if (!fs.existsSync(backendConfigFilePath)) {
        fs.writeFileSync(backendConfigFilePath, '{}', 'utf8');
    }
}
module.exports = {
    pullBackend,
};
//# sourceMappingURL=../../src/lib/lib/pull-backend.js.map