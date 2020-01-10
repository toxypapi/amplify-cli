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
const fs = require('fs');
/**
 * Runs a series of jobs through the templating system.
 *
 * @param {any}             context        - The Amplify CLI context
 * @param {any[]}           jobs           - A list of jobs to run.
 * @param {any}             props          - The props to use for variable replacement.
 * @param {boolean}         force          - Force CF template generation
 * @param {array|object}    privateKeys    - data for the CF template but not parameters file
 */
function copyBatch(context, jobs, props, force, writeParams) {
    return __awaiter(this, void 0, void 0, function* () {
        // grab some features
        const { template, prompt, filesystem } = context;
        const { confirm } = prompt;
        // If the file exists
        const shouldGenerate = (target) => __awaiter(this, void 0, void 0, function* () {
            if (!filesystem.exists(target) || force)
                return true;
            return confirm(`overwrite ${target}`);
        });
        for (let index = 0; index < jobs.length; index += 1) {
            // grab the current job
            const job = jobs[index];
            // safety check
            if (!job) {
                continue;
            }
            // generate the React component
            // TODO: Error handling in event of single file write failure
            if (yield shouldGenerate(job.target, force)) {
                template.generate({
                    directory: job.dir,
                    template: job.template,
                    target: job.target,
                    props,
                });
                if (writeParams && job.paramsFile) {
                    const params = writeParams && Object.keys(writeParams) && Object.keys(writeParams).length > 0 ? writeParams : props;
                    const jsonString = JSON.stringify(params, null, 4);
                    fs.writeFileSync(job.paramsFile, jsonString, 'utf8');
                }
            }
        }
    });
}
module.exports = {
    copyBatch,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/copy-batch.js.map