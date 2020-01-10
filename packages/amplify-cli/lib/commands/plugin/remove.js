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
const plugin_manager_1 = require("../../plugin-manager");
const constants_1 = require("../../domain/constants");
const inquirer_helper_1 = __importStar(require("../../domain/inquirer-helper"));
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = new Array();
        const { plugins } = context.pluginPlatform;
        if (plugins && Object.keys(plugins).length > 0) {
            Object.keys(plugins).forEach(key => {
                if (key === constants_1.constants.CORE) {
                    return;
                }
                if (plugins[key].length > 0) {
                    const option = {
                        name: key + inquirer_helper_1.EXPAND,
                        value: plugins[key],
                        short: key + inquirer_helper_1.EXPAND,
                    };
                    if (plugins[key].length === 1) {
                        const pluginInfo = plugins[key][0];
                        option.name = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                        option.short = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                    }
                    options.push(option);
                }
            });
        }
        if (options.length > 0) {
            const { selections } = yield inquirer_helper_1.default.prompt({
                type: 'checkbox',
                name: 'selections',
                message: 'Select the plugin packages to remove',
                choices: options,
            });
            if (selections.length > 0) {
                const sequential = require('promise-sequential');
                const removeTasks = selections.map((selection) => () => __awaiter(this, void 0, void 0, function* () {
                    yield removeNamedPlugins(context.pluginPlatform, selection);
                }));
                yield sequential(removeTasks);
                yield plugin_manager_1.confirmAndScan(context.pluginPlatform);
            }
        }
        else {
            context.print.console.error('No plugins are found');
        }
    });
}
exports.run = run;
function removeNamedPlugins(pluginPlatform, pluginInfos) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pluginInfos.length === 1) {
            plugin_manager_1.removePluginPackage(pluginPlatform, pluginInfos[0]);
        }
        else if (pluginInfos.length > 1) {
            const options = pluginInfos.map((pluginInfo) => {
                const optionObject = {
                    name: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                    value: pluginInfo,
                    short: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                };
                return optionObject;
            });
            const { selections } = yield inquirer_helper_1.default.prompt({
                type: 'checkbox',
                name: 'selections',
                message: 'Select the plugin packages to remove',
                choices: options,
            });
            if (selections.length > 0) {
                const sequential = require('promise-sequential');
                const removeTasks = selections.map((pluginInfo) => () => __awaiter(this, void 0, void 0, function* () {
                    yield plugin_manager_1.removePluginPackage(pluginPlatform, pluginInfo);
                }));
                yield sequential(removeTasks);
            }
        }
    });
}
//# sourceMappingURL=../../../src/lib/commands/plugin/remove.js.map