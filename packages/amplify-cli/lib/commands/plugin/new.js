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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../domain/constants");
const plugin_manager_1 = require("../../plugin-manager");
const plugin_manager_2 = require("../../plugin-manager");
const add_plugin_result_1 = require("../../domain/add-plugin-result");
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginDirPath = yield plugin_manager_1.createNewPlugin(context, process.cwd());
        if (pluginDirPath) {
            const isPluggedInLocalAmplifyCLI = yield plugIntoLocalAmplifyCli(context, pluginDirPath);
            printInfo(context, pluginDirPath, isPluggedInLocalAmplifyCLI);
        }
    });
}
exports.run = run;
function plugIntoLocalAmplifyCli(context, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let isPluggedIn = false;
        const addPluginResult = plugin_manager_2.addUserPluginPackage(context.pluginPlatform, pluginDirPath);
        if (addPluginResult.isAdded) {
            isPluggedIn = true;
        }
        else {
            context.print.error('Failed to add the plugin package to the local Amplify CLI.');
            context.print.info(`Error code: ${addPluginResult.error}`);
            if (addPluginResult.error === add_plugin_result_1.AddPluginError.FailedVerification &&
                addPluginResult.pluginVerificationResult &&
                addPluginResult.pluginVerificationResult.error) {
                const { error } = addPluginResult.pluginVerificationResult;
                context.print.info(`Plugin verification error code: \ ${error}`);
            }
        }
        return isPluggedIn;
    });
}
// async function plugIntoLocalAmplifyCli(context: Context, pluginDirPath: string):
// Promise<boolean> {
//   let isPluggedIn = false;
//   const yesFlag = context.input.options && context.input.options[Constant.YES];
//   let ifPlugIntoLocalAmplifyCLI = true;
//   if (!yesFlag) {
//     context.print.info('The package can be plugged into the local Amplify CLI \
// for testing during development.');
//     const plugQuestion = {
//       type: 'confirm',
//       name: 'ifPlugIntoLocalAmplifyCLI',
//       message: 'Do you want this package plugged into the local Amplify CLI',
//       default: ifPlugIntoLocalAmplifyCLI,
//     };
//     const answer = await inquirer.prompt(plugQuestion);
//     ifPlugIntoLocalAmplifyCLI = answer.ifPlugIntoLocalAmplifyCLI;
//   }
//   if (ifPlugIntoLocalAmplifyCLI) {
//     const addPluginResult = addUserPluginPackage(context.pluginPlatform, pluginDirPath);
//     if (addPluginResult.isAdded) {
//       isPluggedIn = true;
//       await confirmAndScan(context.pluginPlatform);
//     } else {
//       context.print.error('Failed to add the plugin package.');
//       context.print.info(`Error code: ${addPluginResult.error}`);
//       if (addPluginResult.error === AddPluginError.FailedVerification &&
//                 addPluginResult.pluginVerificationResult &&
//                 addPluginResult.pluginVerificationResult.error) {
//         context.print.info(`Plugin verification error code: \
// ${addPluginResult.pluginVerificationResult.error}`);
//       }
//     }
//   }
//   return isPluggedIn;
// }
function printInfo(context, pluginDirPath, isPluggedInLocalAmplifyCLI) {
    context.print.info('');
    context.print.info(`The plugin package ${path_1.default.basename(pluginDirPath)} \
    has been successfully setup.`);
    context.print.info('Next steps:');
    if (!isPluggedInLocalAmplifyCLI) {
        context.print.info(`$ amplify plugin add: add the plugin into the local Amplify CLI for testing.`);
    }
    const amplifyPluginJsonFilePath = path_1.default.normalize(path_1.default.join(pluginDirPath, constants_1.constants.MANIFEST_FILE_NAME));
    const commandsDirPath = path_1.default.normalize(path_1.default.join(pluginDirPath, 'commands'));
    const eventHandlerDirPath = path_1.default.normalize(path_1.default.join(pluginDirPath, 'event-handlers'));
    context.print.info('');
    context.print.info('To add/remove command:');
    context.print.info('1. Add/remove the command name in the commands array in amplify-plugin.json.');
    context.print.green(amplifyPluginJsonFilePath);
    context.print.info('2. Add/remove the command code file in the commands folder.');
    context.print.green(commandsDirPath);
    context.print.info('');
    context.print.info('To add/remove eventHandlers:');
    context.print.info('1. Add/remove the event name in the eventHandlers array in amplify-plugin.json.');
    context.print.green(amplifyPluginJsonFilePath);
    context.print.info('2. Add/remove the event handler code file into the event-handler folder.');
    context.print.green(eventHandlerDirPath);
    context.print.info('');
}
//# sourceMappingURL=../../../src/lib/commands/plugin/new.js.map