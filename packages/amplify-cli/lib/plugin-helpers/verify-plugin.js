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
const constants_1 = require("../domain/constants");
const readJsonFile_1 = require("../utils/readJsonFile");
const plugin_verification_result_1 = require("../domain/plugin-verification-result");
function verifyPluginSync(pluginDirPath) {
    if (fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory()) {
        return verifyNodePackageSync(pluginDirPath);
    }
    return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.PluginDirPathNotExist);
}
exports.verifyPluginSync = verifyPluginSync;
function verifyPlugin(pluginDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let exists = yield fs_extra_1.default.pathExists(pluginDirPath);
        if (exists) {
            const stat = yield fs_extra_1.default.stat(pluginDirPath);
            if (!stat.isDirectory()) {
                exists = false;
            }
        }
        if (exists) {
            return verifyNodePackage(pluginDirPath);
        }
        return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.PluginDirPathNotExist);
    });
}
exports.verifyPlugin = verifyPlugin;
function validPluginNameSync(pluginName) {
    const result = {
        isValid: true,
    };
    const corePluginJson = readJsonFile_1.readJsonFileSync(path_1.default.normalize(path_1.default.join(__dirname, '../../amplify-plugin.json')));
    if (corePluginJson && corePluginJson.commands && corePluginJson.commands.includes(pluginName)) {
        result.isValid = false;
        result.message = 'Amplify CLI core comand names can not be used as plugin name';
    }
    return result;
}
exports.validPluginNameSync = validPluginNameSync;
function validPluginName(pluginName) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            isValid: true,
        };
        const corePluginJson = yield readJsonFile_1.readJsonFile(path_1.default.normalize(path_1.default.join(__dirname, '../../amplify-plugin.json')));
        if (corePluginJson && corePluginJson.commands && corePluginJson.commands.includes(pluginName)) {
            result.isValid = false;
            result.message = 'Amplify CLI core comand names can not be used as plugin name';
        }
        return result;
    });
}
exports.validPluginName = validPluginName;
function verifyNodePackageSync(pluginDirPath) {
    const pluginPackageJsonFilePath = path_1.default.join(pluginDirPath, constants_1.constants.PACKAGEJSON_FILE_NAME);
    try {
        const packageJson = readJsonFile_1.readJsonFileSync(pluginPackageJsonFilePath);
        const pluginModule = require(pluginDirPath);
        const result = verifyAmplifyManifestSync(pluginDirPath, pluginModule);
        result.packageJson = packageJson;
        return result;
    }
    catch (err) {
        return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidNodePackage, err);
    }
}
function verifyNodePackage(pluginDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginPackageJsonFilePath = path_1.default.join(pluginDirPath, constants_1.constants.PACKAGEJSON_FILE_NAME);
        try {
            const packageJson = yield readJsonFile_1.readJsonFile(pluginPackageJsonFilePath);
            const pluginModule = require(pluginDirPath);
            const result = yield verifyAmplifyManifest(pluginDirPath, pluginModule);
            result.packageJson = packageJson;
            return result;
        }
        catch (err) {
            return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidNodePackage, err);
        }
    });
}
function verifyAmplifyManifestSync(pluginDirPath, pluginModule) {
    const pluginManifestFilePath = path_1.default.join(pluginDirPath, constants_1.constants.MANIFEST_FILE_NAME);
    if (!fs_extra_1.default.existsSync(pluginManifestFilePath) || !fs_extra_1.default.statSync(pluginManifestFilePath).isFile()) {
        return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.MissingManifest);
    }
    try {
        const manifest = readJsonFile_1.readJsonFileSync(pluginManifestFilePath);
        const pluginNameValidationResult = validPluginNameSync(manifest.name);
        if (pluginNameValidationResult.isValid) {
            let result = verifyCommands(manifest, pluginModule);
            result = result.verified ? verifyEventHandlers(manifest, pluginModule) : result;
            result.manifest = manifest;
            return result;
        }
        return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidManifest, pluginNameValidationResult.message);
    }
    catch (err) {
        return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidManifest, err);
    }
}
function verifyAmplifyManifest(pluginDirPath, pluginModule) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginManifestFilePath = path_1.default.join(pluginDirPath, constants_1.constants.MANIFEST_FILE_NAME);
        let exists = yield fs_extra_1.default.pathExists(pluginManifestFilePath);
        if (exists) {
            const stat = yield fs_extra_1.default.stat(pluginManifestFilePath);
            exists = stat.isFile();
        }
        if (!exists) {
            return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.MissingManifest);
        }
        try {
            const manifest = (yield readJsonFile_1.readJsonFile(pluginManifestFilePath));
            const pluginNameValidationResult = yield validPluginName(manifest.name);
            if (pluginNameValidationResult.isValid) {
                let result = verifyCommands(manifest, pluginModule);
                result = result.verified ? verifyEventHandlers(manifest, pluginModule) : result;
                result.manifest = manifest;
                return result;
            }
            return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidManifest, pluginNameValidationResult.message);
        }
        catch (err) {
            return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.InvalidManifest, err);
        }
    });
}
function verifyCommands(manifest, pluginModule) {
    //   let isVerified = true;
    //   if (manifest.commands && manifest.commands.length > 0) {
    //     isVerified = pluginModule.hasOwnProperty(constants.ExecuteAmplifyCommand) &&
    //         typeof pluginModule[constants.ExecuteAmplifyCommand] === 'function';
    //   }
    //   if (isVerified) {
    //     return new PluginVerificationResult(true);
    //   }
    //   return new PluginVerificationResult(
    //             false,
    //             PluginVerificationError.MissingExecuteAmplifyCommandMethod,
    //         );
    // verification should be on the plugin type and if it implement all the required METHODS;
    return new plugin_verification_result_1.PluginVerificationResult(true);
}
function verifyEventHandlers(manifest, pluginModule) {
    let isVerified = true;
    if (manifest.eventHandlers && manifest.eventHandlers.length > 0) {
        isVerified =
            pluginModule.hasOwnProperty(constants_1.constants.HandleAmplifyEvent) && typeof pluginModule[constants_1.constants.HandleAmplifyEvent] === 'function';
    }
    if (isVerified) {
        return new plugin_verification_result_1.PluginVerificationResult(true);
    }
    return new plugin_verification_result_1.PluginVerificationResult(false, plugin_verification_result_1.PluginVerificationError.MissingHandleAmplifyEventMethod);
}
//# sourceMappingURL=../../src/lib/plugin-helpers/verify-plugin.js.map