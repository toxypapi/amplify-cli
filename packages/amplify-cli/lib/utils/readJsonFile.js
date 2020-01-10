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
function stripBOM(content) {
    // tslint:disable-next-line
    if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
    }
    return content;
}
function readJsonFileSync(jsonFilePath, encoding = 'utf8') {
    return JSON.parse(stripBOM(fs_extra_1.default.readFileSync(jsonFilePath, encoding)));
}
exports.readJsonFileSync = readJsonFileSync;
function readJsonFile(jsonFilePath, encoding = 'utf8') {
    return __awaiter(this, void 0, void 0, function* () {
        const contents = yield fs_extra_1.default.readFile(jsonFilePath, encoding);
        return JSON.parse(stripBOM(contents));
    });
}
exports.readJsonFile = readJsonFile;
//# sourceMappingURL=../../src/lib/utils/readJsonFile.js.map