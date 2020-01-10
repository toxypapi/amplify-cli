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
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_manager_1 = require("../../plugin-manager");
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.print.warning('Run this command at the root directory of the plugin package.');
        const verificatonResult = yield plugin_manager_1.verifyPlugin(process.cwd());
        if (verificatonResult.verified) {
            context.print.success('The current directory is verified to be a valid Amplify CLI plugin package.');
            context.print.info('');
        }
        else {
            context.print.error('The current directory faied Amplify CLI plugin verification.');
            context.print.info(`Error code: ${verificatonResult.error}`);
            context.print.info('');
        }
    });
}
exports.run = run;
//# sourceMappingURL=../../../src/lib/commands/plugin/verify.js.map