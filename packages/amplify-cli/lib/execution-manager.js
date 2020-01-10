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
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./domain/constants");
const plugin_manager_1 = require("./plugin-manager");
const inquirer_helper_1 = __importDefault(require("./domain/inquirer-helper"));
const amplify_event_1 = require("./domain/amplify-event");
function executeCommand(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginCandidates = plugin_manager_1.getPluginsWithNameAndCommand(context.pluginPlatform, context.input.plugin, context.input.command);
        if (pluginCandidates.length === 1) {
            yield executePluginModuleCommand(context, pluginCandidates[0]);
        }
        else if (pluginCandidates.length > 1) {
            const answer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'section',
                message: 'Select the module to execute',
                choices: pluginCandidates.map(plugin => {
                    const pluginOptions = {
                        name: plugin.packageName + '@' + plugin.packageVersion,
                        value: plugin,
                        short: plugin.packageName + '@' + plugin.packageVersion,
                    };
                    return pluginOptions;
                }),
            });
            const pluginModule = answer.section;
            yield executePluginModuleCommand(context, pluginModule);
        }
    });
}
exports.executeCommand = executeCommand;
function executePluginModuleCommand(context, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        const { commands, commandAliases } = plugin.manifest;
        if (!commands.includes(context.input.command)) {
            context.input.command = commandAliases[context.input.command];
        }
        if (fs_extra_1.default.existsSync(plugin.packageLocation)) {
            yield raisePreEvent(context);
            const pluginModule = require(plugin.packageLocation);
            if (pluginModule.hasOwnProperty(constants_1.constants.ExecuteAmplifyCommand) &&
                typeof pluginModule[constants_1.constants.ExecuteAmplifyCommand] === 'function') {
                attachContextExtensions(context, plugin);
                yield pluginModule.executeAmplifyCommand(context);
            }
            else {
                // if the module does not have the executeAmplifyCommand method,
                // fall back to the old approach by scanning the command folder and locate the command file
                let commandFilepath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'commands', plugin.manifest.name, context.input.command));
                if (context.input.subCommands && context.input.subCommands.length > 0) {
                    commandFilepath = path_1.default.join(commandFilepath, ...context.input.subCommands);
                }
                let commandModule;
                try {
                    commandModule = require(commandFilepath);
                }
                catch (e) {
                    // do nothing
                }
                if (!commandModule) {
                    commandFilepath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'commands', plugin.manifest.name));
                    try {
                        commandModule = require(commandFilepath);
                    }
                    catch (e) {
                        // do nothing
                    }
                }
                if (commandModule) {
                    attachContextExtensions(context, plugin);
                    yield commandModule.run(context);
                }
                else {
                    const { showAllHelp } = require('./extensions/amplify-helpers/show-all-help');
                    showAllHelp(context);
                }
            }
            yield raisePostEvent(context);
        }
        else {
            yield plugin_manager_1.scan();
            context.print.error('The Amplify CLI plugin platform detected an error.');
            context.print.info('It has performed a fresh scan.');
            context.print.info('Please execute your command again.');
        }
    });
}
function raisePreEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.input.plugin === constants_1.constants.CORE) {
            if (context.input.command === 'init') {
                yield raisePreInitEvent(context);
            }
            else if (context.input.command === 'push') {
                yield raisePrePushEvent(context);
            }
        }
    });
}
function raisePreInitEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PreInit, new amplify_event_1.AmplifyPreInitEventData()));
    });
}
function raisePrePushEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PrePush, new amplify_event_1.AmplifyPrePushEventData()));
    });
}
function raisePostEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.input.plugin === constants_1.constants.CORE) {
            if (context.input.command === 'init') {
                yield raisePostInitEvent(context);
            }
            else if (context.input.command === 'push') {
                yield raisePostPushEvent(context);
            }
        }
    });
}
function raisePostInitEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PostInit, new amplify_event_1.AmplifyPostPushEventData()));
    });
}
function raisePostPushEvent(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PostPush, new amplify_event_1.AmplifyPostInitEventData()));
    });
}
function raiseEvent(context, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const plugins = plugin_manager_1.getPluginsWithEventHandler(context.pluginPlatform, args.event);
        if (plugins.length > 0) {
            const sequential = require('promise-sequential');
            const eventHandlers = plugins
                .filter(plugin => {
                const exists = fs_extra_1.default.existsSync(plugin.packageLocation);
                return exists;
            })
                .map(plugin => {
                const eventHandler = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        attachContextExtensions(context, plugin);
                        const pluginModule = require(plugin.packageLocation);
                        yield pluginModule.handleAmplifyEvent(context, args);
                    }
                    catch (_a) {
                        // no need to need anything
                    }
                });
                return eventHandler;
            });
            yield sequential(eventHandlers);
        }
    });
}
exports.raiseEvent = raiseEvent;
// for backward compatabilities, extensions to the context object
function attachContextExtensions(context, plugin) {
    const extensionsDirPath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'extensions'));
    if (fs_extra_1.default.existsSync(extensionsDirPath)) {
        const stats = fs_extra_1.default.statSync(extensionsDirPath);
        if (stats.isDirectory()) {
            const itemNames = fs_extra_1.default.readdirSync(extensionsDirPath);
            itemNames.forEach(itemName => {
                const itemPath = path_1.default.join(extensionsDirPath, itemName);
                let itemModule;
                try {
                    itemModule = require(itemPath);
                    itemModule(context);
                }
                catch (e) {
                    // do nothing
                }
            });
        }
    }
}
//# sourceMappingURL=../src/lib/execution-manager.js.map