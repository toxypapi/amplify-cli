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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const plugin_manager_1 = require("./plugin-manager");
const input_manager_1 = require("./input-manager");
const context_manager_1 = require("./context-manager");
const context_extensions_1 = require("./context-extensions");
const execution_manager_1 = require("./execution-manager");
const constants_1 = require("./domain/constants");
const project_config_version_check_1 = require("./project-config-version-check");
// entry from commandline
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pluginPlatform = yield plugin_manager_1.getPluginPlatform();
            let input = input_manager_1.getCommandLineInput(pluginPlatform);
            let verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
            // invalid input might be because plugin platform might have been updated,
            // scan and try again
            if (!verificationResult.verified) {
                if (verificationResult.message) {
                    context_extensions_1.print.warning(verificationResult.message);
                }
                pluginPlatform = yield plugin_manager_1.scan();
                input = input_manager_1.getCommandLineInput(pluginPlatform);
                verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
            }
            if (!verificationResult.verified) {
                if (verificationResult.helpCommandAvailable) {
                    input.command = constants_1.constants.HELP;
                }
                else {
                    throw new Error(verificationResult.message);
                }
            }
            const context = context_manager_1.constructContext(pluginPlatform, input);
            yield project_config_version_check_1.checkProjectConfigVersion(context);
            yield execution_manager_1.executeCommand(context);
            context_manager_1.persistContext(context);
            return 0;
        }
        catch (e) {
            // ToDo: add logging to the core, and log execution errors using the unified core logging.
            if (e.message) {
                context_extensions_1.print.error(e.message);
            }
            if (e.stack) {
                context_extensions_1.print.info(e.stack);
            }
            return 1;
        }
    });
}
exports.run = run;
// entry from library call
function execute(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pluginPlatform = yield plugin_manager_1.getPluginPlatform();
            let verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
            if (!verificationResult.verified) {
                if (verificationResult.message) {
                    context_extensions_1.print.warning(verificationResult.message);
                }
                pluginPlatform = yield plugin_manager_1.scan();
                verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
            }
            if (!verificationResult.verified) {
                if (verificationResult.helpCommandAvailable) {
                    input.command = constants_1.constants.HELP;
                }
                else {
                    throw new Error(verificationResult.message);
                }
            }
            const context = context_manager_1.constructContext(pluginPlatform, input);
            yield execution_manager_1.executeCommand(context);
            context_manager_1.persistContext(context);
            return 0;
        }
        catch (e) {
            // ToDo: add logging to the core, and log execution errors using the unified core logging.
            if (e.message) {
                context_extensions_1.print.error(e.message);
            }
            if (e.stack) {
                context_extensions_1.print.info(e.stack);
            }
            return 1;
        }
    });
}
exports.execute = execute;
function executeAmplifyCommand(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandPath = path.normalize(path.join(__dirname, 'commands', context.input.command));
        const commandModule = require(commandPath);
        yield commandModule.run(context);
    });
}
exports.executeAmplifyCommand = executeAmplifyCommand;
//# sourceMappingURL=../src/lib/index.js.map