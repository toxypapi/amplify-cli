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
const { generateLocalEnvInfoFile } = require('./s9-onSuccess');
const url = require('url');
const fs = require('fs-extra');
const path = require('path');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.parameters.options.app) {
            // Setting up a sample app
            context.print.warning('Note: Amplify does not have knowledge of the url provided');
            const repoUrl = context.parameters.options.app;
            yield validateGithubRepo(context, repoUrl);
            yield cloneRepo(context, repoUrl);
            yield installPackage();
            yield setLocalEnvDefaults(context);
        }
        if (context.parameters.options.quickstart) {
            yield createAmplifySkeleton();
            process.exit(0);
        }
        return context;
    });
}
/**
 * Checks whether a url is a valid remote github repository
 *
 * @param repoUrl the url to validated
 * @throws error if url is not a valid remote github url
 */
function validateGithubRepo(context, repoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            url.parse(repoUrl);
            execSync(`git ls-remote ${repoUrl}`, { stdio: 'ignore' });
        }
        catch (e) {
            context.print.error('Invalid remote github url');
            process.exit(1);
        }
    });
}
/**
 * Clones repo from url to current directory (must be empty)
 *
 * @param repoUrl the url to be cloned
 */
function cloneRepo(context, repoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs.readdirSync(process.cwd());
        if (files.length > 0) {
            context.print.error('Please ensure you run this command in an empty directory');
            process.exit(1);
        }
        try {
            execSync(`git clone ${repoUrl} .`, { stdio: 'inherit' });
        }
        catch (e) {
            process.exit(1);
        }
    });
}
/**
 * Install package using the correct package manager if package handling file exists
 *
 * @param packageManager either npm or yarn
 */
function installPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        const packageManager = yield getPackageManager();
        const normalizedPackageManager = yield normalizePackageManagerForOS(packageManager);
        if (normalizedPackageManager) {
            execSync(`${normalizedPackageManager} install`, { stdio: 'inherit' });
        }
    });
}
/**
 * Set the default environment and editor for the local env
 *
 * @param context
 */
function setLocalEnvDefaults(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectPath = process.cwd();
        const defaultEditor = 'vscode';
        const envName = 'sampledev';
        context.print.warning(`Setting default editor to ${defaultEditor}`);
        context.print.warning(`Setting environment to ${envName}`);
        context.print.warning('Run amplify configure project to change the default configuration later');
        context.exeInfo.localEnvInfo = {
            projectPath,
            defaultEditor,
            envName,
        };
        context.exeInfo.inputParams.amplify.envName = envName;
        yield generateLocalEnvInfoFile(context);
    });
}
/**
 * Extract amplify project structure with backend-config and project-config
 */
function createAmplifySkeleton() {
    return __awaiter(this, void 0, void 0, function* () {
        const skeletonLocalDir = path.join(__dirname, '/../../../src/lib/amplify-skeleton');
        const skeletonProjectDir = path.join(process.cwd(), '/amplify');
        yield fs.copySync(skeletonLocalDir, skeletonProjectDir);
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/preInitSetup.js.map