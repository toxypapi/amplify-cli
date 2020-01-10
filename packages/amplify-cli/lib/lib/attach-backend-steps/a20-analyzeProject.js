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
const { normalizeEditor, editorSelection } = require('../../extensions/amplify-helpers/editor-selection');
const { PROJECT_CONFIG_VERSION } = require('../../extensions/amplify-helpers/constants');
const { readJsonFile } = require('../../extensions/amplify-helpers/read-json-file');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultEditor = getDefaultEditor(context);
        if (!defaultEditor) {
            defaultEditor = yield getEditor(context);
        }
        if ((context.exeInfo.inputParams && context.exeInfo.inputParams.yes) || context.parameters.options.forcePush) {
            context.exeInfo.forcePush = true;
        }
        else {
            context.exeInfo.forcePush = false;
        }
        context.exeInfo.projectConfig.version = PROJECT_CONFIG_VERSION;
        context.exeInfo.localEnvInfo.defaultEditor = defaultEditor;
        return context;
    });
}
/* End getProjectName */
/* Begin getEditor */
function getEditor(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let editor;
        if (context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.defaultEditor) {
            editor = normalizeEditor(context.exeInfo.inputParams.amplify.defaultEditor);
        }
        else if (!context.exeInfo.inputParams.yes) {
            editor = yield editorSelection(editor);
        }
        return editor;
    });
}
function getDefaultEditor(context) {
    let defaultEditor;
    const projectPath = process.cwd();
    const localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath(projectPath);
    if (fs.existsSync(localEnvFilePath)) {
        ({ defaultEditor } = readJsonFile(localEnvFilePath));
    }
    return defaultEditor;
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/attach-backend-steps/a20-analyzeProject.js.map