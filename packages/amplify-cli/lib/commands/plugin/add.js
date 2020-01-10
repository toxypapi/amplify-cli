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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../domain/constants");
const plugin_manager_1 = require("../../plugin-manager");
const inquirer_helper_1 = __importStar(require("../../domain/inquirer-helper"));
const add_plugin_result_1 = require("../../domain/add-plugin-result");
const scan_plugin_platform_1 = require("../../plugin-helpers/scan-plugin-platform");
const NEW_PLUGIN_PACKAGE = 'A new plugin package';
const CANCEL = 'cancel';
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.input.subCommands && context.input.subCommands.length > 1) {
            const input = context.input.subCommands[1];
            const { excluded } = context.pluginPlatform;
            if (excluded[input] && excluded[input].length > 0) {
                const { confirmed } = yield inquirer_helper_1.default.prompt({
                    type: 'confirm',
                    name: 'confirmed',
                    message: `Add from previously removed ${input} plugin`,
                    default: true,
                });
                if (confirmed) {
                    yield addExcludedPluginPackage(context, excluded[input]);
                }
                else {
                    yield resolvePluginPathAndAdd(context, input);
                }
            }
            else {
                yield resolvePluginPathAndAdd(context, input);
            }
        }
        else {
            yield promptAndAdd(context);
        }
    });
}
exports.run = run;
function resolvePluginPathAndAdd(context, inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginDirPath = yield resolvePluginPackagePath(context, inputPath);
        if (pluginDirPath) {
            addNewPluginPackage(context, pluginDirPath);
        }
    });
}
function resolvePluginPackagePath(context, inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (path_1.default.isAbsolute(inputPath)) {
            return inputPath;
        }
        let result;
        const { pluginPlatform } = context;
        let searchDirPaths = [constants_1.constants.ParentDirectory, constants_1.constants.LocalNodeModules, constants_1.constants.GlobalNodeModules, process.cwd()];
        searchDirPaths = searchDirPaths.filter(dirPath => !pluginPlatform.pluginDirectories.includes(dirPath.toString()));
        searchDirPaths = searchDirPaths.concat(pluginPlatform.pluginDirectories);
        const candicatePluginDirPaths = searchDirPaths
            .map(dirPath => path_1.default.normalize(path_1.default.join(scan_plugin_platform_1.normalizePluginDirectory(dirPath), inputPath)))
            .filter(pluginDirPath => fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory());
        if (candicatePluginDirPaths.length === 0) {
            context.print.error('Can not locate the plugin package.');
            result = yield promptForPluginPath();
        }
        else if (candicatePluginDirPaths.length === 1) {
            context.print.green('Plugin package found.');
            context.print.blue(candicatePluginDirPaths[0]);
            const { confirmed } = yield inquirer_helper_1.default.prompt({
                type: 'confirm',
                name: 'confirmed',
                message: `Confirm to add the plugin package to your Amplify CLI.`,
                default: true,
            });
            if (confirmed) {
                result = candicatePluginDirPaths[0];
            }
        }
        else if (candicatePluginDirPaths.length > 1) {
            context.print.warning('Multiple plugins with the package name are found.');
            const options = candicatePluginDirPaths.concat([CANCEL]);
            const answer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the plugin package to add',
                choices: options,
            });
            if (answer.selection !== CANCEL) {
                result = answer.selection;
            }
        }
        return result;
    });
}
function promptAndAdd(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = new Array();
        const { excluded } = context.pluginPlatform;
        if (excluded && Object.keys(excluded).length > 0) {
            Object.keys(excluded).forEach(key => {
                if (excluded[key].length > 0) {
                    const option = {
                        name: key + inquirer_helper_1.EXPAND,
                        value: excluded[key],
                        short: key + inquirer_helper_1.EXPAND,
                    };
                    if (excluded[key].length === 1) {
                        const pluginInfo = excluded[key][0];
                        option.name = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                        option.short = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                    }
                    options.push(option);
                }
            });
        }
        if (options.length > 0) {
            options.unshift({
                name: NEW_PLUGIN_PACKAGE,
                value: NEW_PLUGIN_PACKAGE,
                short: NEW_PLUGIN_PACKAGE,
            });
            const answer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the plugin package to add',
                choices: options,
            });
            if (answer.selection === NEW_PLUGIN_PACKAGE) {
                const pluginDirPath = yield promptForPluginPath();
                yield addNewPluginPackage(context, pluginDirPath);
            }
            else {
                yield addExcludedPluginPackage(context, answer.selection);
            }
        }
        else {
            const pluginDirPath = yield promptForPluginPath();
            yield addNewPluginPackage(context, pluginDirPath);
        }
    });
}
function promptForPluginPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'input',
            name: 'pluginDirPath',
            message: `Enter the absolute path for the root of the plugin directory: ${os_1.default.EOL}`,
            transformer: (pluginDirPath) => pluginDirPath.trim(),
            validate: (pluginDirPath) => {
                pluginDirPath = pluginDirPath.trim();
                if (fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory()) {
                    return true;
                }
                return 'The plugin package directory path you entered does NOT exist';
            },
        });
        return answer.pluginDirPath;
    });
}
function addNewPluginPackage(context, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const addUserPluginResult = plugin_manager_1.addUserPluginPackage(context.pluginPlatform, pluginDirPath.trim());
            if (addUserPluginResult.isAdded) {
                context.print.success('Successfully added plugin package.');
                yield plugin_manager_1.confirmAndScan(context.pluginPlatform);
            }
            else {
                context.print.error('Failed to add the plugin package.');
                context.print.info(`Error code: ${addUserPluginResult.error}`);
                if (addUserPluginResult.error === add_plugin_result_1.AddPluginError.FailedVerification &&
                    addUserPluginResult.pluginVerificationResult &&
                    addUserPluginResult.pluginVerificationResult.error) {
                    context.print.info(`Plugin verification error code: ${addUserPluginResult.pluginVerificationResult.error}`);
                }
            }
        }
        catch (e) {
            context.print.error('Failed to add the plugin package.');
            context.print.info(e);
        }
    });
}
function addExcludedPluginPackage(context, userSelection) {
    return __awaiter(this, void 0, void 0, function* () {
        if (userSelection.length > 0) {
            if (userSelection.length === 1) {
                plugin_manager_1.addExcludedPluginPackage(context.pluginPlatform, userSelection[0]);
            }
            else {
                const options = new Array();
                userSelection.forEach(pluginInfo => {
                    options.push({
                        name: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                        value: pluginInfo,
                        short: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                    });
                });
                const answer = yield inquirer_helper_1.default.prompt({
                    type: 'list',
                    name: 'selection',
                    message: 'Select the plugin package to add',
                    choices: options,
                });
                plugin_manager_1.addExcludedPluginPackage(context.pluginPlatform, answer.selection);
            }
            yield plugin_manager_1.confirmAndScan(context.pluginPlatform);
        }
    });
}
//# sourceMappingURL=../../../src/lib/commands/plugin/add.js.map