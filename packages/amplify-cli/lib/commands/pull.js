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
const { pullBackend } = require('../lib/pull-backend');
const { attachBackend } = require('../lib/attach-backend');
const { constructInputParams } = require('../lib/amplify-service-helper');
const { run: envCheckout } = require('./env/checkout');
module.exports = {
    name: 'pull',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const inputParams = constructInputParams(context);
        const currentAmplifyMetaFilePath = context.amplify.pathManager.getCurrentAmplifyMetaFilePath(process.cwd());
        if (fs.existsSync(currentAmplifyMetaFilePath)) {
            const { appId: inputAppId, envName: inputEnvName } = inputParams.amplify;
            const teamProviderInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath(process.cwd());
            const localEnvInfoFilePath = context.amplify.pathManager.getLocalEnvFilePath(process.cwd());
            const teamProviderInfo = context.amplify.readJsonFile(teamProviderInfoFilePath);
            const { envName } = context.amplify.readJsonFile(localEnvInfoFilePath);
            const { AmplifyAppId } = teamProviderInfo[envName].awscloudformation;
            const localEnvNames = Object.keys(teamProviderInfo);
            if (inputAppId && AmplifyAppId && inputAppId !== AmplifyAppId) {
                context.print.error('Amplify appId mismatch.');
                context.print.info(`You are currently working in the amplify project with Id ${AmplifyAppId}`);
                process.exit(1);
            }
            if (inputEnvName) {
                if (inputEnvName === envName) {
                    yield pullBackend(context, inputParams);
                }
                else if (localEnvNames.includes(inputEnvName)) {
                    context.parameters.options = {};
                    context.parameters.first = inputEnvName;
                    yield envCheckout(context);
                }
                else {
                    inputParams.amplify.appId = inputAppId;
                    yield attachBackend(context, inputParams);
                }
            }
            else {
                yield pullBackend(context, inputParams);
            }
        }
        else {
            yield attachBackend(context, inputParams);
        }
    }),
};
//# sourceMappingURL=../../src/lib/commands/pull.js.map