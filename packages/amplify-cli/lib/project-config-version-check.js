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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const inquirer_helper_1 = __importDefault(require("./domain/inquirer-helper"));
const prevLambdaRuntimeVersions = ['nodejs8.10'];
const lambdaRuntimeVersion = 'nodejs10.x';
const jsonIndentation = 4;
function checkProjectConfigVersion(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pathManager, readJsonFile, constants } = context.amplify;
        const projectPath = pathManager.searchProjectRootPath();
        if (projectPath) {
            const projectConfigFilePath = pathManager.getProjectConfigFilePath(projectPath);
            if (fs.existsSync(projectConfigFilePath)) {
                const projectConfig = readJsonFile(projectConfigFilePath);
                if (projectConfig.version !== constants.PROJECT_CONFIG_VERSION) {
                    yield checkLambdaCustomResourceNodeVersion(context, projectPath);
                    projectConfig.version = constants.PROJECT_CONFIG_VERSION;
                    const jsonString = JSON.stringify(projectConfig, null, jsonIndentation);
                    fs.writeFileSync(projectConfigFilePath, jsonString, 'utf8');
                }
            }
        }
    });
}
exports.checkProjectConfigVersion = checkProjectConfigVersion;
///////////////////////////////////////////////////////////////////
////// check lambda custom resources nodejs runtime version ///////
///////////////////////////////////////////////////////////////////
function checkLambdaCustomResourceNodeVersion(context, projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pathManager } = context.amplify;
        const backendDirPath = pathManager.getBackendDirPath(projectPath);
        const filesToUpdate = [];
        if (fs.existsSync(backendDirPath)) {
            const categoryDirNames = fs.readdirSync(backendDirPath);
            categoryDirNames.forEach(categoryDirName => {
                const categoryDirPath = path.join(backendDirPath, categoryDirName);
                if (!fs.statSync(categoryDirPath).isDirectory()) {
                    return;
                }
                const resourceDirNames = fs.readdirSync(categoryDirPath);
                resourceDirNames.forEach(resourceDirName => {
                    const resourceDirPath = path.join(categoryDirPath, resourceDirName);
                    if (!fs.statSync(resourceDirPath).isDirectory()) {
                        return;
                    }
                    const fileNames = fs.readdirSync(resourceDirPath);
                    fileNames.forEach(fileName => {
                        const filePath = path.join(resourceDirPath, fileName);
                        if (!fs.statSync(filePath).isFile()) {
                            return;
                        }
                        const templateFileNamePattern = new RegExp('template');
                        if (templateFileNamePattern.test(fileName)) {
                            const fileString = fs.readFileSync(filePath, 'utf8');
                            if (checkFileContent(fileString)) {
                                filesToUpdate.push(filePath);
                            }
                        }
                    });
                });
            });
        }
        if (filesToUpdate.length > 0) {
            let confirmed = context.input.options && context.input.options.yes;
            confirmed = confirmed || (yield promptForConfirmation(context, filesToUpdate));
            if (confirmed) {
                filesToUpdate.forEach(filePath => {
                    let fileString = fs.readFileSync(filePath, 'utf8');
                    fileString = updateFileContent(fileString);
                    fs.writeFileSync(filePath, fileString, 'utf8');
                });
                context.print.info('');
                context.print.success('NodeJS runtime version updated successfully to 10.x in all the CloudFormation templates.');
                context.print.warning('Make sure the template changes are pushed to the cloud by "amplify push"');
            }
        }
    });
}
function checkFileContent(fileString) {
    let result = false;
    for (let i = 0; i < prevLambdaRuntimeVersions.length; i++) {
        if (fileString.includes(prevLambdaRuntimeVersions[i])) {
            result = true;
            break;
        }
    }
    return result;
}
function updateFileContent(fileString) {
    let result = fileString;
    prevLambdaRuntimeVersions.forEach(prevVersion => {
        result = result.replace(prevVersion, lambdaRuntimeVersion);
    });
    return result;
}
function promptForConfirmation(context, filesToUpdate) {
    return __awaiter(this, void 0, void 0, function* () {
        context.print.info('');
        context.print.info('Amplify CLI uses Lambda backed custom resources with CloudFormation to manage part of your backend resources.');
        context.print.info('In response to the Lambda Runtime support deprecation schedule');
        context.print.green('https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html');
        context.print.warning(`Nodejs runtime need to be updated from ${prevLambdaRuntimeVersions}  to ${lambdaRuntimeVersion} in the following template files:`);
        filesToUpdate.forEach(filePath => {
            context.print.info(filePath);
        });
        context.print.info('');
        context.print.warning(`Please test the changes in a test environment before pushing these changes to production. There might be a need to update your Lambda function source code due to the NodeJS runtime update. Please take a look at https://aws-amplify.github.io/docs/cli/lambda-node-version-update for more information`);
        context.print.info('');
        const question = {
            type: 'confirm',
            name: 'confirmUpdateNodeVersion',
            message: 'Confirm to update the NodeJS runtime version to 10.x',
            default: true,
        };
        const answer = yield inquirer_helper_1.default.prompt(question);
        if (!answer.confirmUpdateNodeVersion) {
            const warningMessage = `After a runtime is deprecated, \
Lambda might retire it completely at any time by disabling invocation. \
Deprecated runtimes aren't eligible for security updates or technical support. \
Before retiring a runtime, Lambda sends additional notifications to affected customers.`;
            context.print.warning(warningMessage);
            context.print.info('You will need to manually update the NodeJS runtime in the template files and push the udpates to the cloud.');
        }
        return answer.confirmUpdateNodeVersion;
    });
}
//# sourceMappingURL=../src/lib/project-config-version-check.js.map