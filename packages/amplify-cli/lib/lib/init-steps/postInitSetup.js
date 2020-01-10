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
const { execSync } = require('child_process');
const { getPackageManager } = require('../packageManagerHelpers');
const { normalizePackageManagerForOS } = require('../packageManagerHelpers');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.parameters.options.app) {
            // Pushing a sample app
            try {
                context.parameters.options.app = true;
                context.parameters.options.y = true;
                context.amplify.constructExeInfo(context);
                yield context.amplify.pushResources(context);
                yield runPackage();
            }
            catch (e) {
                if (e.name !== 'InvalidDirectiveError') {
                    context.print.error(`An error occured during the push operation: ${e.message}`);
                }
                process.exit(1);
            }
        }
    });
}
/**
 * Install package using the correct package manager if package handling file exists
 *
 * @param packageManager either npm or yarn
 */
function runPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        const packageManager = yield getPackageManager();
        const normalizedPackageManager = yield normalizePackageManagerForOS(packageManager);
        if (normalizedPackageManager) {
            execSync(`${normalizedPackageManager} start`, { stdio: 'inherit' });
        }
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/postInitSetup.js.map