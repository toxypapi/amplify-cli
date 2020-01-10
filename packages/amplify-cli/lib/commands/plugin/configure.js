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
const os_1 = __importDefault(require("os"));
const inquirer_helper_1 = __importDefault(require("../../domain/inquirer-helper"));
const constants_1 = require("../../domain/constants");
const access_plugins_file_1 = require("../../plugin-helpers/access-plugins-file");
const scan_plugin_platform_1 = require("../../plugin-helpers/scan-plugin-platform");
const plugin_manager_1 = require("../../plugin-manager");
const display_plugin_platform_1 = require("../../plugin-helpers/display-plugin-platform");
const MINPREFIXLENGTH = 2;
const MAXPREFIXLENGTH = 20;
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pluginPlatform } = context;
        const pluginDirectories = 'scannable plugin directories';
        const pluginPrefixes = 'scannable plugin prefixes';
        const maxScanIntervalInSeconds = 'max CLI scan interval in seconds';
        const exit = 'save & exit';
        const options = [pluginDirectories, pluginPrefixes, maxScanIntervalInSeconds, exit];
        let answer;
        do {
            answer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the following options to configure',
                choices: options,
            });
            switch (answer.selection) {
                case pluginDirectories:
                    yield configurePluginDirectories(context, pluginPlatform);
                    break;
                case pluginPrefixes:
                    yield configurePrefixes(context, pluginPlatform);
                    break;
                case maxScanIntervalInSeconds:
                    yield configureScanInterval(context, pluginPlatform);
                    break;
                default:
                    configurePluginDirectories(context, pluginPlatform);
                    break;
            }
        } while (answer.selection !== exit);
        access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
        return plugin_manager_1.scan(pluginPlatform);
    });
}
exports.run = run;
function configurePluginDirectories(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
        const ADD = 'add';
        const REMOVE = 'remove';
        const EXIT = 'exit';
        const LEARNMORE = 'Learn more';
        const actionAnswer = yield inquirer_helper_1.default.prompt({
            type: 'list',
            name: 'action',
            message: 'Select the action on the directory list',
            choices: [ADD, REMOVE, EXIT, LEARNMORE],
        });
        if (actionAnswer.action === ADD) {
            yield addPluginDirectory(pluginPlatform);
        }
        else if (actionAnswer.action === REMOVE) {
            yield removePluginDirectory(pluginPlatform);
            if (pluginPlatform.pluginDirectories.length === 0) {
                context.print.warning('You have removed all plugin directories.');
                context.print.info('Plugin scan is now ineffecitive. \
Only explicitly added plugins are active.');
                context.print.info('The Amplify CLI might not be fully functional.');
            }
        }
        else if (actionAnswer.action === LEARNMORE) {
            displayPluginDirectoriesLearnMore(context);
            yield configurePluginDirectories(context, pluginPlatform);
        }
        display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
    });
}
function displayPluginDirectoriesLearnMore(context) {
    context.print.info('');
    context.print.green('The directories contained this list are searched for \
plugins in a plugin scan.');
    context.print.green('You can add or remove from this list to change the \
scan behavior, and consequently its outcome.');
    context.print.green('There are three well-known directories that the CLI \
usually scans for plugins.');
    context.print.red(constants_1.constants.ParentDirectory);
    context.print.green(`${constants_1.constants.ParentDirectory} \
is the directory that contains the Amplify CLI Core package.`);
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.constants.ParentDirectory));
    context.print.red(constants_1.constants.LocalNodeModules);
    context.print.green(`${constants_1.constants.LocalNodeModules} \
is the Amplify CLI Core package's local node_modules directory. `);
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.constants.LocalNodeModules));
    context.print.red(constants_1.constants.GlobalNodeModules);
    context.print.green(`${constants_1.constants.GlobalNodeModules} \
is the global node_modules directory.`);
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.constants.GlobalNodeModules));
    context.print.info('');
}
function addPluginDirectory(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const ADDCUSTOMDIRECTORY = 'Add custom directory >';
        let options = [constants_1.constants.ParentDirectory, constants_1.constants.LocalNodeModules, constants_1.constants.GlobalNodeModules];
        options = options.filter(item => !pluginPlatform.pluginDirectories.includes(item.toString()));
        let addCustomDirectory = false;
        if (options.length > 0) {
            options.push(ADDCUSTOMDIRECTORY);
            const selectionAnswer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the directory to add',
                choices: options,
            });
            if (selectionAnswer.selection === ADDCUSTOMDIRECTORY) {
                addCustomDirectory = true;
            }
            else {
                pluginPlatform.pluginDirectories.push(selectionAnswer.selection);
            }
        }
        else {
            addCustomDirectory = true;
        }
        if (addCustomDirectory) {
            const addNewAnswer = yield inquirer_helper_1.default.prompt({
                type: 'input',
                name: 'newScanDirectory',
                message: `Enter the full path of the plugin scan directory you want to add${os_1.default.EOL}`,
                validate: (input) => {
                    if (!fs_extra_1.default.existsSync(input) || !fs_extra_1.default.statSync(input).isDirectory()) {
                        return 'Must enter a valid full path of a directory';
                    }
                    return true;
                },
            });
            pluginPlatform.pluginDirectories.push(addNewAnswer.newScanDirectory.trim());
        }
    });
}
function removePluginDirectory(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'checkbox',
            name: 'directoriesToRemove',
            message: 'Select the directories that Amplify CLI should NOT scan for plugins',
            choices: pluginPlatform.pluginDirectories,
        });
        pluginPlatform.pluginDirectories = pluginPlatform.pluginDirectories.filter(dir => !answer.directoriesToRemove.includes(dir));
    });
}
function configurePrefixes(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
        const ADD = 'add';
        const REMOVE = 'remove';
        const EXIT = 'exit';
        const LEARNMORE = 'Learn more';
        const actionAnswer = yield inquirer_helper_1.default.prompt({
            type: 'list',
            name: 'action',
            message: 'Select the action on the prefix list',
            choices: [ADD, REMOVE, LEARNMORE, EXIT],
        });
        if (actionAnswer.action === ADD) {
            yield addPrefix(pluginPlatform);
        }
        else if (actionAnswer.action === REMOVE) {
            yield removePrefixes(pluginPlatform);
            if (pluginPlatform.pluginPrefixes.length === 0) {
                context.print.warning('You have removed all prefixes for plugin dir name matching!');
                context.print.info('All the packages inside the plugin directories will be checked \
during a plugin scan, this can significantly increase the scan time.');
            }
        }
        else if (actionAnswer.action === LEARNMORE) {
            displayPluginPrefixesLearnMore(context);
            yield configurePluginDirectories(context, pluginPlatform);
        }
        display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
    });
}
function displayPluginPrefixesLearnMore(context) {
    context.print.info('');
    context.print.green('The package name prefixes contained this list are used for \
plugin name matching in plugin scans.');
    context.print.green('Only packages with matching name are considered plugin candidates, \
they are verified and then added to the Amplify CLI.');
    context.print.green('If this list is empty, all packages inside the scanned directories \
are checked in plugin scans.');
    context.print.green('You can add or remove from this list to change the plugin \
scan behavior, and consequently its outcome.');
    context.print.green('The offical prefix is:');
    context.print.red(constants_1.constants.AmplifyPrefix);
    context.print.info('');
}
function addPrefix(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const ADDCUSTOMPREFIX = 'Add custom prefix >';
        let options = [constants_1.constants.AmplifyPrefix];
        options = options.filter(item => !pluginPlatform.pluginPrefixes.includes(item.toString()));
        let addCustomPrefix = false;
        if (options.length > 0) {
            options.push(ADDCUSTOMPREFIX);
            const selectionAnswer = yield inquirer_helper_1.default.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the prefix to add',
                choices: options,
            });
            if (selectionAnswer.selection === ADDCUSTOMPREFIX) {
                addCustomPrefix = true;
            }
            else {
                pluginPlatform.pluginPrefixes.push(selectionAnswer.selection);
            }
        }
        else {
            addCustomPrefix = true;
        }
        if (addCustomPrefix) {
            const addNewAnswer = yield inquirer_helper_1.default.prompt({
                type: 'input',
                name: 'newPrefix',
                message: 'Enter the new prefix',
                validate: (input) => {
                    input = input.trim();
                    if (input.length < MINPREFIXLENGTH || input.length > MAXPREFIXLENGTH) {
                        return 'The Length of prefix must be between 2 and 20.';
                    }
                    if (!/^[a-zA-Z][a-zA-Z0-9-]+$/.test(input)) {
                        return 'Prefix must start with letter, and contain only alphanumerics and dashes(-)';
                    }
                    return true;
                },
            });
            pluginPlatform.pluginPrefixes.push(addNewAnswer.newPrefix.trim());
        }
    });
}
function removePrefixes(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'checkbox',
            name: 'prefixesToRemove',
            message: 'Select the prefixes to remove',
            choices: pluginPlatform.pluginPrefixes,
        });
        pluginPlatform.pluginPrefixes = pluginPlatform.pluginPrefixes.filter(prefix => !answer.prefixesToRemove.includes(prefix));
    });
}
function configureScanInterval(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        context.print.green('The Amplify CLI plugin platform regularly scans the local \
system to update its internal metadata on the locally installed plugins.');
        context.print.green('This automatic scan will happen if the last scan \
time has passed for longer than max-scan-interval-in-seconds.');
        context.print.info('');
        display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'input',
            name: 'interval',
            message: 'Enter the max interval in seconds for automatic plugin scans',
            default: pluginPlatform.maxScanIntervalInSeconds,
            validate: (input) => {
                if (isNaN(Number(input))) {
                    return 'must enter nubmer';
                }
                return true;
            },
        });
        pluginPlatform.maxScanIntervalInSeconds = parseInt(answer.interval, 10);
        display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
    });
}
function listConfiguration(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginDirectories = 'plugin directories';
        const pluginPrefixes = 'plugin prefixes';
        const maxScanIntervalInSeconds = 'max scan interval in seconds';
        const all = 'all';
        const options = [pluginDirectories, pluginPrefixes, maxScanIntervalInSeconds, all];
        const answer = yield inquirer_helper_1.default.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select the section to list',
            choices: options,
        });
        switch (answer.selection) {
            case pluginDirectories:
                display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
                break;
            case pluginPrefixes:
                display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
                break;
            case maxScanIntervalInSeconds:
                display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
                break;
            case all:
                display_plugin_platform_1.displayConfiguration(context, pluginPlatform);
                break;
            default:
                display_plugin_platform_1.displayConfiguration(context, pluginPlatform);
                break;
        }
    });
}
exports.listConfiguration = listConfiguration;
//# sourceMappingURL=../../../src/lib/commands/plugin/configure.js.map