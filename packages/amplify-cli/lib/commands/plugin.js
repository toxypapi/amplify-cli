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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let subCommand = 'help';
        if (context.input.subCommands && context.input.subCommands.length > 0) {
            subCommand = context.input.subCommands[0];
        }
        subCommand = mapSubcommandAlias(subCommand);
        const subCommandPath = path_1.default.normalize(path_1.default.join(__dirname, 'plugin', subCommand));
        Promise.resolve().then(() => __importStar(require(subCommandPath))).then((subCommandModule) => __awaiter(this, void 0, void 0, function* () {
            yield subCommandModule.run(context);
        }))
            .catch(() => {
            context.print.error(`Cannot load command amplify plugin ${subCommand}`);
        });
    });
}
exports.run = run;
function mapSubcommandAlias(subcommand) {
    if (subcommand === 'init') {
        return 'new';
    }
    return subcommand;
}
//# sourceMappingURL=../../src/lib/commands/plugin.js.map