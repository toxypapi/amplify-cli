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
const chalk_1 = __importDefault(require("chalk"));
const readJsonFile_1 = require("../utils/readJsonFile");
const indent = '    ';
function checkPlatformHealth(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function* () {
        const activePlugins = pluginPlatform.plugins;
        const officialPlugins = getOfficialPlugins();
        const missingOfficialPlugins = [];
        const mismatchedOfficialPlugins = [];
        Object.keys(officialPlugins).forEach((plugin) => {
            const officialPluginDescription = officialPlugins[plugin];
            if (activePlugins[officialPluginDescription.name]) {
                let isPackageMatching = false;
                activePlugins[officialPluginDescription.name].every((pluginInfo) => {
                    if (isMatching(officialPluginDescription, pluginInfo)) {
                        isPackageMatching = true;
                        return false;
                    }
                    return true;
                });
                if (!isPackageMatching) {
                    mismatchedOfficialPlugins.push(officialPluginDescription);
                }
            }
            else {
                missingOfficialPlugins.push(officialPluginDescription);
            }
        });
        if (missingOfficialPlugins.length > 0) {
            console.log(chalk_1.default.yellow('The following official plugins are missing or inactive:'));
            missingOfficialPlugins.forEach((pluginDescription) => {
                const { name, type, packageName, packageVersion } = pluginDescription;
                console.log(`${indent}${name}: ${type} | ${packageName}@${packageVersion}`);
            });
        }
        if (mismatchedOfficialPlugins.length > 0) {
            console.log(chalk_1.default.yellow('The following official plugins have mismatched packages:'));
            mismatchedOfficialPlugins.forEach((pluginDescription) => {
                const { name, type, packageName, packageVersion } = pluginDescription;
                console.log('Expected:');
                console.log(`${indent}${name}: ${type} | ${packageName}@${packageVersion}`);
                console.log('Found:');
                activePlugins[name].every((pluginInfo) => {
                    const { manifest } = pluginInfo;
                    console.log(`${indent}${manifest.name}: ${manifest.type} | ${pluginInfo.packageName}@${pluginInfo.packageVersion}`);
                });
            });
        }
        return missingOfficialPlugins.length === 0 && mismatchedOfficialPlugins.length === 0;
    });
}
exports.checkPlatformHealth = checkPlatformHealth;
function isMatching(pluginDescription, pluginInfo) {
    let result = pluginDescription.packageName === pluginInfo.packageName && pluginDescription.type === pluginInfo.manifest.type;
    if (result && pluginDescription.packageVersion) {
        result = pluginDescription.packageVersion === pluginInfo.packageVersion;
    }
    return result;
}
function getOfficialPlugins() {
    const packageJsonFilePath = path_1.default.normalize(path_1.default.join(__dirname, '../../package.json'));
    const packageJson = readJsonFile_1.readJsonFileSync(packageJsonFilePath);
    const { officialPlugins } = packageJson.amplify;
    const dependencies = packageJson.dependencies;
    Object.keys(officialPlugins).forEach((plugin) => {
        const { packageName } = officialPlugins[plugin];
        if (dependencies[packageName]) {
            const version = dependencies[packageName];
            officialPlugins[plugin].packageVersion = version;
        }
        else {
            delete officialPlugins[plugin].packageVersion;
        }
    });
    const coreVersion = packageJson.version;
    officialPlugins.core.packageVersion = coreVersion;
    return officialPlugins;
}
exports.getOfficialPlugins = getOfficialPlugins;
//# sourceMappingURL=../../src/lib/plugin-helpers/platform-health-check.js.map