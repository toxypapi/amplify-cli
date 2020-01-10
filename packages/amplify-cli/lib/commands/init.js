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
const preInitSetup = require('../lib/init-steps/preInitSetup');
const postInitSetup = require('../lib/init-steps/postInitSetup');
const analyzeProject = require('../lib/init-steps/s0-analyzeProject');
const initFrontendHandler = require('../lib/init-steps/s1-initFrontend');
const initProviders = require('../lib/init-steps/s2-initProviders');
const onFailure = require('../lib/init-steps/s9-onFailure');
const onSuccess = require('../lib/init-steps/s9-onSuccess');
const { constructInputParams } = require('../lib/amplify-service-helper');
module.exports = {
    name: 'init',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        constructExeInfo(context);
        yield preInitSetup
            .run(context)
            .then(analyzeProject.run)
            .then(initFrontendHandler.run)
            .then(initProviders.run)
            .then(onSuccess.run)
            .catch(onFailure.run);
        yield postInitSetup.run(context).catch(onFailure.run);
    }),
};
function constructExeInfo(context) {
    context.exeInfo = {
        inputParams: constructInputParams(context),
    };
}
//# sourceMappingURL=../../src/lib/commands/init.js.map