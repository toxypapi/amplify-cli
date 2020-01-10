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
const path = require('path');
const fs = require('fs');
const which = require('which');
/**
 * Determine the package manager of the current project
 *
 * @return {string} 'yarn' if yarn.lock exists, 'npm' if package.json exists, undefined otherwise
 */
function getPackageManager() {
    return __awaiter(this, void 0, void 0, function* () {
        const yarnLock = './yarn.lock';
        const yarnLockDir = path.join(process.cwd(), yarnLock);
        const packageJson = './package.json';
        const packageJsonDir = path.join(process.cwd(), packageJson);
        if (fs.existsSync(yarnLockDir)) {
            // Check that yarn is installed for the user
            if (which.sync('yarn', { nothrow: true }) || which.sync('yarn.cmd', { nothrow: true })) {
                return 'yarn';
            }
            return 'npm';
        }
        else if (fs.existsSync(packageJsonDir)) {
            return 'npm';
        }
        return undefined;
    });
}
/**
 * Determines the OS and returns the corresponding command given a package manager
 *
 * @param {string} packageManager the type of package manager detected
 * @return {string} the package manager command for the correct OS
 */
function normalizePackageManagerForOS(packageManager) {
    return __awaiter(this, void 0, void 0, function* () {
        const isOnWindows = /^win/.test(process.platform);
        if (isOnWindows) {
            if (packageManager === 'yarn') {
                return 'yarn.cmd';
            }
            else if (!packageManager) {
                return undefined;
            }
            return 'npm.cmd';
        }
        return packageManager;
    });
}
module.exports = {
    getPackageManager,
    normalizePackageManagerForOS,
};
//# sourceMappingURL=../../src/lib/lib/packageManagerHelpers.js.map