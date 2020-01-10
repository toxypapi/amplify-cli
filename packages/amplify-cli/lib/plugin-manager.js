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
const plugin_info_1 = require("./domain/plugin-info");
const access_plugins_file_1 = require("./plugin-helpers/access-plugins-file");
const scan_plugin_platform_1 = require("./plugin-helpers/scan-plugin-platform");
const verify_plugin_1 = require("./plugin-helpers/verify-plugin");
exports.verifyPlugin = verify_plugin_1.verifyPlugin;
const create_new_plugin_1 = __importDefault(require("./plugin-helpers/create-new-plugin"));
exports.createNewPlugin = create_new_plugin_1.default;
const add_plugin_result_1 = require("./domain/add-plugin-result");
const compare_plugins_1 = require("./plugin-helpers/compare-plugins");
const inquirer_helper_1 = __importDefault(require("./domain/inquirer-helper"));
const constants_1 = require("./domain/constants");
const context_extensions_1 = require("./context-extensions");
function getPluginPlatform() {
    return __awaiter(this, void 0, void 0, function* () {
        // This function is called at the beginning of each command execution
        // and performs the following actions:
        // 1. read the plugins.json file
        // 2. checks the last scan time stamp,
        // 3. re-scan if needed.
        // 4. write to update the plugins.json file if re-scan is performed
        // 5. return the pluginsInfo object
        let pluginPlatform = access_plugins_file_1.readPluginsJsonFileSync();
        if (pluginPlatform) {
            if (isCoreMatching(pluginPlatform)) {
                const lastScanTime = new Date(pluginPlatform.lastScanTime);
                const currentTime = new Date();
                // tslint:disable-next-line
                const timeDiffInSeconds = (currentTime.getTime() - lastScanTime.getTime()) / 1000;
                if (timeDiffInSeconds > pluginPlatform.maxScanIntervalInSeconds) {
                    pluginPlatform = yield scan();
                }
            }
            else {
                pluginPlatform = yield scan();
            }
        }
        else {
            pluginPlatform = yield scan();
        }
        return pluginPlatform;
    });
}
exports.getPluginPlatform = getPluginPlatform;
function isCoreMatching(pluginPlatform) {
    try {
        const currentCorePluginDirPath = scan_plugin_platform_1.getCorePluginDirPath();
        const currentCorePluginVersion = scan_plugin_platform_1.getCorePluginVersion();
        const platformCorePluginDirPath = pluginPlatform.plugins[constants_1.constants.CORE][0].packageLocation;
        const platformCorePluginVersion = pluginPlatform.plugins[constants_1.constants.CORE][0].packageVersion;
        return currentCorePluginDirPath === platformCorePluginDirPath && currentCorePluginVersion === platformCorePluginVersion;
    }
    catch (_a) {
        return false;
    }
}
function getPluginsWithName(pluginPlatform, nameOrAlias) {
    let result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(pluginName => {
        if (pluginName === nameOrAlias) {
            result = result.concat(pluginPlatform.plugins[pluginName]);
        }
        else {
            pluginPlatform.plugins[pluginName].forEach(pluginInfo => {
                if (pluginInfo.manifest.aliases && pluginInfo.manifest.aliases.includes(nameOrAlias)) {
                    result.push(pluginInfo);
                }
            });
        }
    });
    return result;
}
exports.getPluginsWithName = getPluginsWithName;
function getPluginsWithNameAndCommand(pluginPlatform, nameOrAlias, command) {
    const result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(pluginName => {
        pluginPlatform.plugins[pluginName].forEach(pluginInfo => {
            const { name, aliases, commands, commandAliases } = pluginInfo.manifest;
            const nameOrAliasMatching = name === nameOrAlias || (aliases && aliases.includes(nameOrAlias));
            if (nameOrAliasMatching) {
                if ((commands && commands.includes(command)) || (commandAliases && Object.keys(commandAliases).includes(command))) {
                    result.push(pluginInfo);
                }
            }
        });
    });
    return result;
}
exports.getPluginsWithNameAndCommand = getPluginsWithNameAndCommand;
function getPluginsWithEventHandler(pluginPlatform, event) {
    const result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(pluginName => {
        pluginPlatform.plugins[pluginName].forEach(pluginInfo => {
            const { eventHandlers } = pluginInfo.manifest;
            if (eventHandlers && eventHandlers.length > 0 && eventHandlers.includes(event)) {
                result.push(pluginInfo);
            }
        });
    });
    return result;
}
exports.getPluginsWithEventHandler = getPluginsWithEventHandler;
function getAllPluginNames(pluginPlatform) {
    const result = new Set();
    Object.keys(pluginPlatform.plugins).forEach(pluginName => {
        result.add(pluginName);
        pluginPlatform.plugins[pluginName].forEach(pluginInfo => {
            if (pluginInfo.manifest.aliases && pluginInfo.manifest.aliases.length > 0) {
                pluginInfo.manifest.aliases.forEach(alias => {
                    result.add(alias);
                });
            }
        });
    });
    return result;
}
exports.getAllPluginNames = getAllPluginNames;
function scan(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        context_extensions_1.print.info('Scanning for plugins...');
        try {
            const result = yield scan_plugin_platform_1.scanPluginPlatform(pluginPlatform);
            context_extensions_1.print.info('Plugin scan successful');
            return result;
        }
        catch (e) {
            context_extensions_1.print.error('Plugin scan failed.');
            throw new Error('Plugin scan failed.');
        }
    });
}
exports.scan = scan;
function confirmAndScan(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const { confirmed } = yield inquirer_helper_1.default.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: 'Run a fresh scan for plugins on the Amplify CLI pluggable platform',
            default: false,
        });
        if (confirmed) {
            yield scan(pluginPlatform);
        }
    });
}
exports.confirmAndScan = confirmAndScan;
function addUserPluginPackage(pluginPlatform, pluginDirPath) {
    return addPluginPackage(pluginPlatform, pluginDirPath);
}
exports.addUserPluginPackage = addUserPluginPackage;
function addExcludedPluginPackage(pluginPlatform, pluginInfo) {
    return addPluginPackage(pluginPlatform, pluginInfo.packageLocation);
}
exports.addExcludedPluginPackage = addExcludedPluginPackage;
function addPluginPackage(pluginPlatform, pluginDirPath) {
    const pluginVerificationResult = verify_plugin_1.verifyPluginSync(pluginDirPath);
    const result = new add_plugin_result_1.AddPluginResult(false, pluginVerificationResult);
    if (pluginVerificationResult.verified) {
        const { packageJson, manifest } = pluginVerificationResult;
        const pluginInfo = new plugin_info_1.PluginInfo(packageJson.name, packageJson.version, pluginDirPath, manifest);
        // take the package out of the excluded
        if (pluginPlatform.excluded[pluginInfo.manifest.name] && pluginPlatform.excluded[pluginInfo.manifest.name].length > 0) {
            const updatedExcluded = new Array();
            pluginPlatform.excluded[pluginInfo.manifest.name].forEach(pluginInfoItem => {
                if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                    updatedExcluded.push(pluginInfoItem);
                }
            });
            if (updatedExcluded.length > 0) {
                pluginPlatform.excluded[pluginInfo.manifest.name] = updatedExcluded;
            }
            else {
                delete pluginPlatform.excluded[pluginInfo.manifest.name];
            }
        }
        // insert into the plugins
        const updatedPlugins = new Array();
        if (pluginPlatform.plugins[pluginInfo.manifest.name] && pluginPlatform.plugins[pluginInfo.manifest.name].length > 0) {
            pluginPlatform.plugins[pluginInfo.manifest.name].forEach(pluginInfoItem => {
                if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                    updatedPlugins.push(pluginInfoItem);
                }
            });
        }
        updatedPlugins.push(pluginInfo);
        pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins;
        // insert into the userAddedLocations if it's not under scan coverage
        if (!scan_plugin_platform_1.isUnderScanCoverageSync(pluginPlatform, pluginDirPath) && !pluginPlatform.userAddedLocations.includes(pluginDirPath)) {
            pluginPlatform.userAddedLocations.push(pluginDirPath);
        }
        // write the plugins.json file
        access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
        result.isAdded = true;
    }
    else {
        result.error = add_plugin_result_1.AddPluginError.FailedVerification;
    }
    return result;
}
exports.addPluginPackage = addPluginPackage;
// remove: select from the plugins only,
// if the location belongs to the scan directories, put the info inside the excluded.
// if the location is in the useraddedlocaitons, remove it from the user added locations.
function removePluginPackage(pluginPlatform, pluginInfo) {
    // remove from the plugins
    if (pluginPlatform.plugins[pluginInfo.manifest.name] && pluginPlatform.plugins[pluginInfo.manifest.name].length > 0) {
        const updatedPlugins = new Array();
        pluginPlatform.plugins[pluginInfo.manifest.name].forEach(pluginInfoItem => {
            if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                updatedPlugins.push(pluginInfoItem);
            }
        });
        if (updatedPlugins.length > 0) {
            pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins;
        }
        else {
            delete pluginPlatform.plugins[pluginInfo.manifest.name];
        }
    }
    // remove from the userAddedLocations
    if (pluginPlatform.userAddedLocations.includes(pluginInfo.packageLocation)) {
        const updatedUserAddedLocations = new Array();
        pluginPlatform.userAddedLocations.forEach(packageLocation => {
            if (packageLocation !== pluginInfo.packageLocation) {
                updatedUserAddedLocations.push(packageLocation);
            }
        });
        pluginPlatform.userAddedLocations = updatedUserAddedLocations;
    }
    // if the plugin is under scan coverage, insert into the excluded
    if (scan_plugin_platform_1.isUnderScanCoverageSync(pluginPlatform, pluginInfo.packageLocation)) {
        pluginPlatform.excluded[pluginInfo.manifest.name] = pluginPlatform.excluded[pluginInfo.manifest.name] || [];
        pluginPlatform.excluded[pluginInfo.manifest.name].push(pluginInfo);
    }
    access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
}
exports.removePluginPackage = removePluginPackage;
//# sourceMappingURL=../src/lib/plugin-manager.js.map