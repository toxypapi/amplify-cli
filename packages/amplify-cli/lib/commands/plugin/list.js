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
const inquirer_helper_1 = __importDefault(require("../../domain/inquirer-helper"));
const display_plugin_platform_1 = require("../../plugin-helpers/display-plugin-platform");
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pluginPlatform } = context;
        const plugins = 'active plugins';
        const excluded = 'excluded plugins';
        const generalInfo = 'general information';
        const options = [plugins, excluded, generalInfo];
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select the section to list',
            choices: options,
        });
        switch (answer.selection) {
            case plugins:
                listPluginCollection(context, pluginPlatform.plugins);
                break;
            case excluded:
                listPluginCollection(context, pluginPlatform.excluded);
                break;
            case generalInfo:
                display_plugin_platform_1.displayGeneralInfo(context, pluginPlatform);
                break;
            default:
                listPluginCollection(context, pluginPlatform.plugins);
                break;
        }
    });
}
exports.run = run;
function listPluginCollection(context, collection) {
    return __awaiter(this, void 0, void 0, function* () {
        const all = 'all';
        const options = Object.keys(collection);
        if (options.length > 0) {
            let toList = options[0];
            if (options.length > 1) {
                options.push(all);
                const answer = yield inquirer_helper_1.default.prompt({
                    type: 'list',
                    name: 'selection',
                    message: 'Select the name of the plugin to list',
                    choices: options,
                });
                toList = answer.selection;
            }
            if (toList === all) {
                display_plugin_platform_1.displayPluginCollection(context, collection);
            }
            else {
                display_plugin_platform_1.displayPluginInfoArray(context, collection[toList]);
            }
        }
        else {
            context.print.info('The collection is empty');
        }
    });
}
//# sourceMappingURL=../../../src/lib/commands/plugin/list.js.map