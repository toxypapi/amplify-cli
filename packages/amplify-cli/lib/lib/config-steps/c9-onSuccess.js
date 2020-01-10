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
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { projectPath } = context.exeInfo;
        const { amplify } = context;
        let jsonString = JSON.stringify(context.exeInfo.projectConfig, null, 4);
        const projectConfigFilePath = amplify.pathManager.getProjectConfigFilePath(projectPath);
        fs.writeFileSync(projectConfigFilePath, jsonString, 'utf8');
        jsonString = JSON.stringify(context.exeInfo.localEnvInfo, null, 4);
        const envFilePath = context.amplify.pathManager.getLocalEnvFilePath();
        fs.writeFileSync(envFilePath, jsonString, 'utf8');
        yield context.amplify.onCategoryOutputsChange(context);
        printWelcomeMessage(context);
    });
}
function printWelcomeMessage(context) {
    context.print.info('');
    context.print.success('Successfully made configuration changes to your project.');
    context.print.info('');
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c9-onSuccess.js.map