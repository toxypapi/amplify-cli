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
const fs_extra_1 = __importDefault(require("fs-extra"));
const inquirer_helper_1 = __importDefault(require("../domain/inquirer-helper"));
const constants_1 = require("../domain/constants");
const amplify_event_1 = require("../domain/amplify-event");
const amplify_plugin_type_1 = require("../domain/amplify-plugin-type");
const readJsonFile_1 = require("../utils/readJsonFile");
const verify_plugin_1 = require("./verify-plugin");
const display_plugin_platform_1 = require("./display-plugin-platform");
const INDENTATIONSPACE = 4;
function createNewPlugin(context, pluginParentDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginName = yield getPluginName(context, pluginParentDirPath);
        if (pluginName) {
            return yield copyAndUpdateTemplateFiles(context, pluginParentDirPath, pluginName);
        }
        return undefined;
    });
}
exports.default = createNewPlugin;
function getPluginName(context, pluginParentDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let pluginName = 'my-amplify-plugin';
        const yesFlag = context.input.options && context.input.options[constants_1.constants.YES];
        if (context.input.subCommands.length > 1) {
            // subcommands: ['new', 'name']
            pluginName = context.input.subCommands[1];
        }
        else if (!yesFlag) {
            const pluginNameQuestion = {
                type: 'input',
                name: 'pluginName',
                message: 'What should be the name of the plugin:',
                default: pluginName,
                validate: (input) => {
                    const pluginNameValidationResult = verify_plugin_1.validPluginNameSync(input);
                    if (!pluginNameValidationResult.isValid) {
                        return pluginNameValidationResult.message || 'Invalid plugin name';
                    }
                    return true;
                },
            };
            const answer = yield inquirer_helper_1.default.prompt(pluginNameQuestion);
            pluginName = answer.pluginName;
        }
        const pluginDirPath = path_1.default.join(pluginParentDirPath, pluginName);
        if (fs_extra_1.default.existsSync(pluginDirPath) && !yesFlag) {
            context.print.error(`The directory ${pluginName} already exists`);
            const overwriteQuestion = {
                type: 'confirm',
                name: 'ifOverWrite',
                message: 'Do you want to overwrite it?',
                default: false,
            };
            const answer = yield inquirer_helper_1.default.prompt(overwriteQuestion);
            if (answer.ifOverWrite) {
                return pluginName;
            }
            return undefined;
        }
        return pluginName;
    });
}
function copyAndUpdateTemplateFiles(context, pluginParentDirPath, pluginName) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginDirPath = path_1.default.join(pluginParentDirPath, pluginName);
        fs_extra_1.default.emptyDirSync(pluginDirPath);
        const pluginType = yield promptForPluginType(context);
        const eventHandlers = yield promptForEventSubscription(context);
        let srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template');
        if (pluginType === amplify_plugin_type_1.AmplifyPluginType.frontend.toString()) {
            srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template-frontend');
        }
        else if (pluginType === amplify_plugin_type_1.AmplifyPluginType.provider.toString()) {
            srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template-provider');
        }
        fs_extra_1.default.copySync(srcDirPath, pluginDirPath);
        updatePackageJson(pluginDirPath, pluginName);
        updateAmplifyPluginJson(pluginDirPath, pluginName, pluginType, eventHandlers);
        updateEventHandlersFolder(pluginDirPath, eventHandlers);
        return pluginDirPath;
    });
}
function promptForPluginType(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const yesFlag = context.input.options && context.input.options[constants_1.constants.YES];
        if (yesFlag) {
            return amplify_plugin_type_1.AmplifyPluginType.util;
        }
        {
            const pluginTypes = Object.keys(amplify_plugin_type_1.AmplifyPluginType);
            const LEARNMORE = 'Learn more';
            const choices = pluginTypes.concat([LEARNMORE]);
            const answer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Specify the plugin type',
                choices,
                default: amplify_plugin_type_1.AmplifyPluginType.util,
            });
            if (answer.selection === LEARNMORE) {
                displayAmplifyPluginTypesLearnMore(context);
                return yield promptForPluginType(context);
            }
            return answer.selection;
        }
    });
}
function displayAmplifyPluginTypesLearnMore(context) {
    context.print.green('The Amplify CLI supports these plugin types:');
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.category);
    context.print.green(`${amplify_plugin_type_1.AmplifyPluginType.category} plugins allows the CLI user to add, \
remove and configure a set of backend resources. They in turn use provider plugins to \
provision these resources in the cloud.`);
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.provider);
    context.print.green(`${amplify_plugin_type_1.AmplifyPluginType.provider} plugins expose methods for other plugins \
like the category plugin to provision resources in the cloud. The Amplify CLI prompts the user \
to select provider plugins to initialize during the execution of the amplify init command \
(if there are multiple cloud provider plugins present), \
and then invoke the init method of the selected provider plugins.`);
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.frontend);
    context.print.green(`${amplify_plugin_type_1.AmplifyPluginType.frontend} plugins are responsible for detecting \
the frontend framework used by the frontend project and handle the frontend project and handle \
generation of all the configuration files required by the frontend framework.`);
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.util);
    context.print.green(`${amplify_plugin_type_1.AmplifyPluginType.util} plugins are general purpose utility plugins, \
they provide utility functions for other plugins.`);
    context.print.green('For more information please read - \
https://aws-amplify.github.io/docs/cli-toolchain/plugins');
}
function promptForEventSubscription(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const yesFlag = context.input.options && context.input.options[constants_1.constants.YES];
        const eventHandlers = Object.keys(amplify_event_1.AmplifyEvent);
        if (yesFlag) {
            return eventHandlers;
        }
        {
            const LEARNMORE = 'Learn more';
            const choices = eventHandlers.concat([LEARNMORE]);
            const answer = yield inquirer_helper_1.default.prompt({
                type: 'checkbox',
                name: 'selections',
                message: 'What Amplify CLI events do you want the plugin to handle?',
                choices,
                default: eventHandlers,
            });
            if (answer.selections.includes(LEARNMORE)) {
                displayAmplifyEventsLearnMore(context);
                return yield promptForEventSubscription(context);
            }
            return answer.selections;
        }
    });
}
function displayAmplifyEventsLearnMore(context) {
    const indentationStr = display_plugin_platform_1.createIndentation(INDENTATIONSPACE);
    context.print.green('The Amplify CLI aims to provide a flexible and loosely-coupled \
pluggable platforms for the plugins.');
    context.print.green('To make this possible, \
the platform broadcasts events for plugins to handle.');
    context.print.green('If a plugin subscribes to an event, its event handler is \
invoked by the Amplify CLI Core on such event.');
    context.print.green('');
    context.print.green('The Amplify CLI currently broadcasts these events to plugins:');
    context.print.red(amplify_event_1.AmplifyEvent.PreInit);
    context.print.green(`${indentationStr}${amplify_event_1.AmplifyEvent.PreInit} handler is invoked prior to the \
execution of the amplify init command.`);
    context.print.red(amplify_event_1.AmplifyEvent.PostInit);
    context.print.green(`${indentationStr}${amplify_event_1.AmplifyEvent.PostInit} handler is invoked on the \
complete execution of the amplify init command.`);
    context.print.red(amplify_event_1.AmplifyEvent.PrePush);
    context.print.green(`${indentationStr}${amplify_event_1.AmplifyEvent.PrePush} handler is invoked prior to the \
executionof the amplify push command.`);
    context.print.red(amplify_event_1.AmplifyEvent.PostPush);
    context.print.green(`${indentationStr}${amplify_event_1.AmplifyEvent.PostPush} handler is invoked on the \
complete execution of the amplify push command.`);
    context.print.warning('This feature is currently under actively development, \
events might be added or removed in future releases');
}
function updatePackageJson(pluginDirPath, pluginName) {
    const filePath = path_1.default.join(pluginDirPath, 'package.json');
    const packageJson = readJsonFile_1.readJsonFileSync(filePath);
    packageJson.name = pluginName;
    const jsonString = JSON.stringify(packageJson, null, INDENTATIONSPACE);
    fs_extra_1.default.writeFileSync(filePath, jsonString, 'utf8');
}
function updateAmplifyPluginJson(pluginDirPath, pluginName, pluginType, eventHandlers) {
    const filePath = path_1.default.join(pluginDirPath, constants_1.constants.MANIFEST_FILE_NAME);
    const amplifyPluginJson = readJsonFile_1.readJsonFileSync(filePath);
    amplifyPluginJson.name = pluginName;
    amplifyPluginJson.type = pluginType;
    amplifyPluginJson.eventHandlers = eventHandlers;
    const jsonString = JSON.stringify(amplifyPluginJson, null, INDENTATIONSPACE);
    fs_extra_1.default.writeFileSync(filePath, jsonString, 'utf8');
}
function updateEventHandlersFolder(pluginDirPath, eventHandlers) {
    const dirPath = path_1.default.join(pluginDirPath, 'event-handlers');
    const fileNames = fs_extra_1.default.readdirSync(dirPath);
    fileNames.forEach(fileName => {
        const eventName = fileName.replace('handle-', '').split('.')[0];
        if (!eventHandlers.includes(eventName)) {
            fs_extra_1.default.removeSync(path_1.default.join(dirPath, fileName));
        }
    });
}
//# sourceMappingURL=../../src/lib/plugin-helpers/create-new-plugin.js.map