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
const inquirer = require('inquirer');
const _ = require('lodash');
const crudFlow = (role, permissionMap = {}, defaults = []) => __awaiter(void 0, void 0, void 0, function* () {
    if (!role)
        throw new Error('No role provided to permission question flow');
    const possibleOperations = Object.keys(permissionMap).map(el => ({ name: el, value: el }));
    const answers = yield inquirer.prompt({
        name: 'permissions',
        type: 'checkbox',
        message: `What kind of access do you want for ${role} users?`,
        choices: possibleOperations,
        default: defaults,
        validate: inputs => {
            if (inputs.length === 0) {
                return 'Select at least one option';
            }
            return true;
        },
    });
    return _.uniq(_.flatten(answers.permissions.map(e => permissionMap[e])));
});
module.exports = { crudFlow };
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/permission-flow.js.map