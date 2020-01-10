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
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const constants_1 = require("../domain/constants");
const readJsonFile_1 = require("../utils/readJsonFile");
const JSON_SPACE = 4;
function readPluginsJsonFileSync() {
    let result;
    const pluginsFilePath = getPluginsJsonFilePath();
    if (fs_extra_1.default.existsSync(pluginsFilePath)) {
        result = readJsonFile_1.readJsonFileSync(pluginsFilePath);
    }
    return result;
}
exports.readPluginsJsonFileSync = readPluginsJsonFileSync;
function readPluginsJsonFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        const pluginsFilePath = getPluginsJsonFilePath();
        const exists = yield fs_extra_1.default.pathExists(pluginsFilePath);
        if (exists) {
            result = yield readJsonFile_1.readJsonFile(pluginsFilePath);
        }
        return result;
    });
}
exports.readPluginsJsonFile = readPluginsJsonFile;
function writePluginsJsonFileSync(pluginsJson) {
    const systemDotAmplifyDirPath = getSystemDotAmplifyDirPath();
    const pluginsJsonFilePath = path_1.default.join(systemDotAmplifyDirPath, getPluginsJsonFileName());
    fs_extra_1.default.ensureDirSync(systemDotAmplifyDirPath);
    const jsonString = JSON.stringify(pluginsJson, null, JSON_SPACE);
    fs_extra_1.default.writeFileSync(pluginsJsonFilePath, jsonString, 'utf8');
}
exports.writePluginsJsonFileSync = writePluginsJsonFileSync;
function writePluginsJsonFile(pluginsJson) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemDotAmplifyDirPath = getSystemDotAmplifyDirPath();
        const pluginsJsonFilePath = path_1.default.join(systemDotAmplifyDirPath, getPluginsJsonFileName());
        yield fs_extra_1.default.ensureDir(systemDotAmplifyDirPath);
        const jsonString = JSON.stringify(pluginsJson, null, JSON_SPACE);
        yield fs_extra_1.default.writeFile(pluginsJsonFilePath, jsonString, 'utf8');
    });
}
exports.writePluginsJsonFile = writePluginsJsonFile;
function getPluginsJsonFilePath() {
    return path_1.default.join(getSystemDotAmplifyDirPath(), getPluginsJsonFileName());
}
function getSystemDotAmplifyDirPath() {
    return path_1.default.join(os_1.default.homedir(), constants_1.constants.DotAmplifyDirName);
}
function getPluginsJsonFileName() {
    let result = constants_1.constants.PLUGINS_FILE_NAME;
    const amplifyExecutableName = path_1.default.basename(process.argv[1]);
    if (amplifyExecutableName === 'amplify-dev') {
        result = `${amplifyExecutableName}-${constants_1.constants.PLUGINS_FILE_NAME}`;
    }
    return result;
}
//# sourceMappingURL=../../src/lib/plugin-helpers/access-plugins-file.js.map