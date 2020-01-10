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
const analyzeProject = require('../lib/config-steps/c0-analyzeProject');
const configFrontendHandler = require('../lib/config-steps/c1-configFrontend');
const configProviders = require('../lib/config-steps/c2-configProviders');
const configureNewUser = require('../lib/configure-new-user');
const onFailure = require('../lib/config-steps/c9-onFailure');
const onSuccess = require('../lib/config-steps/c9-onSuccess');
const { normalizeInputParams } = require('../lib/input-params-manager');
module.exports = {
    name: 'configure',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!context.parameters.first) {
            yield configureNewUser.run(context);
        }
        if (context.parameters.first === 'project') {
            constructExeInfo(context);
            yield analyzeProject
                .run(context)
                .then(configFrontendHandler.run)
                .then(configProviders.run)
                .then(onSuccess.run)
                .catch(onFailure.run);
        }
    }),
};
function constructExeInfo(context) {
    context.exeInfo = context.amplify.getProjectDetails();
    context.exeInfo.inputParams = normalizeInputParams(context);
}
//# sourceMappingURL=../../src/lib/commands/configure.js.map