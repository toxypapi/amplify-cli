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
const plugin_collection_1 = require("../domain/plugin-collection");
const plugin_platform_1 = require("../domain/plugin-platform");
const constants_1 = require("../domain/constants");
const global_prefix_1 = require("../utils/global-prefix");
const plugin_info_1 = require("../domain/plugin-info");
const verify_plugin_1 = require("./verify-plugin");
const access_plugins_file_1 = require("./access-plugins-file");
const compare_plugins_1 = require("./compare-plugins");
const platform_health_check_1 = require("./platform-health-check");
const readJsonFile_1 = require("../utils/readJsonFile");
const is_child_path_1 = __importDefault(require("../utils/is-child-path"));
function scanPluginPlatform(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        pluginPlatform = pluginPlatform || (yield access_plugins_file_1.readPluginsJsonFile()) || new plugin_platform_1.PluginPlatform();
        pluginPlatform.plugins = new plugin_collection_1.PluginCollection();
        yield addCore(pluginPlatform);
        const sequential = require('promise-sequential');
        if (pluginPlatform.userAddedLocations && pluginPlatform.userAddedLocations.length > 0) {
            // clean up the userAddedLocation first
            pluginPlatform.userAddedLocations = pluginPlatform.userAddedLocations.filter(pluginDirPath => {
                const result = fs_extra_1.default.existsSync(pluginDirPath);
                return result;
            });
            const scanUserLocationTasks = pluginPlatform.userAddedLocations.map(pluginDirPath => () => __awaiter(this, void 0, void 0, function* () { return yield verifyAndAdd(pluginPlatform, pluginDirPath); }));
            yield sequential(scanUserLocationTasks);
        }
        if (pluginPlatform.pluginDirectories.length > 0 && pluginPlatform.pluginPrefixes.length > 0) {
            const scanDirTasks = pluginPlatform.pluginDirectories.map(directory => () => __awaiter(this, void 0, void 0, function* () {
                directory = normalizePluginDirectory(directory);
                const exists = yield fs_extra_1.default.pathExists(directory);
                if (exists) {
                    const subDirNames = yield fs_extra_1.default.readdir(directory);
                    if (subDirNames.length > 0) {
                        const scanSubDirTasks = subDirNames.map(subDirName => {
                            return () => __awaiter(this, void 0, void 0, function* () {
                                if (isMatchingNamePattern(pluginPlatform.pluginPrefixes, subDirName)) {
                                    const pluginDirPath = path_1.default.join(directory, subDirName);
                                    yield verifyAndAdd(pluginPlatform, pluginDirPath);
                                }
                            });
                        });
                        yield sequential(scanSubDirTasks);
                    }
                }
            }));
            yield sequential(scanDirTasks);
        }
        pluginPlatform.lastScanTime = new Date();
        yield access_plugins_file_1.writePluginsJsonFile(pluginPlatform);
        yield platform_health_check_1.checkPlatformHealth(pluginPlatform);
        return pluginPlatform;
    });
}
exports.scanPluginPlatform = scanPluginPlatform;
function getCorePluginDirPath() {
    return path_1.default.normalize(path_1.default.join(__dirname, '../../'));
}
exports.getCorePluginDirPath = getCorePluginDirPath;
function getCorePluginVersion() {
    const packageJsonFilePath = path_1.default.normalize(path_1.default.join(__dirname, '../../package.json'));
    const packageJson = readJsonFile_1.readJsonFileSync(packageJsonFilePath);
    return packageJson.version;
}
exports.getCorePluginVersion = getCorePluginVersion;
function addCore(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const corePluginDirPath = getCorePluginDirPath();
        const pluginVerificationResult = yield verify_plugin_1.verifyPlugin(corePluginDirPath);
        if (pluginVerificationResult.verified) {
            const manifest = pluginVerificationResult.manifest;
            const { name, version } = pluginVerificationResult.packageJson;
            const pluginInfo = new plugin_info_1.PluginInfo(name, version, corePluginDirPath, manifest);
            pluginPlatform.plugins[manifest.name] = [];
            pluginPlatform.plugins[manifest.name].push(pluginInfo);
        }
        else {
            throw new Error('The local Amplify-CLI is corrupted');
        }
    });
}
function normalizePluginDirectory(directory) {
    let result = directory;
    if (directory === constants_1.constants.LocalNodeModules) {
        result = path_1.default.normalize(path_1.default.join(__dirname, '../../node_modules'));
    }
    else if (directory === constants_1.constants.ParentDirectory) {
        result = path_1.default.normalize(path_1.default.join(__dirname, '../../../'));
    }
    else if (directory === constants_1.constants.GlobalNodeModules) {
        result = global_prefix_1.getGlobalNodeModuleDirPath();
    }
    return result;
}
exports.normalizePluginDirectory = normalizePluginDirectory;
function isMatchingNamePattern(pluginPrefixes, pluginDirName) {
    if (pluginPrefixes && pluginPrefixes.length > 0) {
        return pluginPrefixes.some(prefix => {
            const regex = new RegExp(`^${prefix}`);
            return regex.test(pluginDirName);
        });
    }
    return true;
}
function verifyAndAdd(pluginPlatform, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginVerificationResult = yield verify_plugin_1.verifyPlugin(pluginDirPath);
        if (pluginVerificationResult.verified &&
            // Only the current core is added by the addCore(.) method, other packages can not be core
            pluginVerificationResult.manifest.name !== constants_1.constants.CORE) {
            const manifest = pluginVerificationResult.manifest;
            const { name, version } = pluginVerificationResult.packageJson;
            const pluginInfo = new plugin_info_1.PluginInfo(name, version, pluginDirPath, manifest);
            let isPluginExcluded = false;
            if (pluginPlatform.excluded && pluginPlatform.excluded[manifest.name]) {
                isPluginExcluded = pluginPlatform.excluded[manifest.name].some(item => compare_plugins_1.twoPluginsAreTheSame(item, pluginInfo));
            }
            if (!isPluginExcluded) {
                pluginPlatform.plugins[manifest.name] = pluginPlatform.plugins[manifest.name] || [];
                const pluginAlreadyAdded = pluginPlatform.plugins[manifest.name].some(item => compare_plugins_1.twoPluginsAreTheSame(item, pluginInfo));
                if (!pluginAlreadyAdded) {
                    pluginPlatform.plugins[manifest.name].push(pluginInfo);
                }
            }
        }
    });
}
function isUnderScanCoverageSync(pluginPlatform, pluginDirPath) {
    let result = false;
    pluginDirPath = path_1.default.normalize(pluginDirPath);
    const pluginDirName = path_1.default.basename(pluginDirPath);
    if (fs_extra_1.default.existsSync(pluginDirPath) && isMatchingNamePattern(pluginPlatform.pluginPrefixes, pluginDirName)) {
        result = pluginPlatform.pluginDirectories.some(directory => {
            directory = normalizePluginDirectory(directory);
            if (fs_extra_1.default.existsSync(directory) && is_child_path_1.default(pluginDirPath, directory)) {
                return true;
            }
        });
    }
    return result;
}
exports.isUnderScanCoverageSync = isUnderScanCoverageSync;
//# sourceMappingURL=../../src/lib/plugin-helpers/scan-plugin-platform.js.map