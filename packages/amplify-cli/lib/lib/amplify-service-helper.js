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
const { normalizeInputParams } = require('./input-params-manager');
function constructInputParams(context) {
    const inputParams = normalizeInputParams(context);
    if (inputParams.appId) {
        inputParams.amplify.appId = inputParams.appId;
        delete inputParams.appId;
    }
    if (inputParams.envName) {
        inputParams.amplify.envName = inputParams.envName;
        delete inputParams.envName;
    }
    if (inputParams['no-override'] !== undefined) {
        inputParams.amplify.noOverride = inputParams['no-override'];
        delete inputParams['no-override'];
    }
    return inputParams;
}
function postPullCodeGenCheck(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.print.info('');
    });
}
module.exports = {
    constructInputParams,
    postPullCodeGenCheck,
};
//# sourceMappingURL=../../src/lib/lib/amplify-service-helper.js.map