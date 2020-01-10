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
const chalk = require('chalk');
module.exports = {
    name: 'list',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { envName } = context.amplify.getEnvInfo();
        if (context.parameters.options.details) {
            const allEnvs = context.amplify.getEnvDetails();
            if (context.parameters.options.json) {
                context.print.fancy(JSON.stringify(allEnvs, null, 4));
                return;
            }
            Object.keys(allEnvs).forEach(env => {
                context.print.info('');
                if (envName === env) {
                    context.print.info(chalk.red(`*${env}*`));
                }
                else {
                    context.print.info(chalk.yellow(env));
                }
                context.print.info('--------------');
                Object.keys(allEnvs[env]).forEach(provider => {
                    context.print.info(`Provider: ${provider}`);
                    Object.keys(allEnvs[env][provider]).forEach(providerAttr => {
                        context.print.info(`${providerAttr}: ${allEnvs[env][provider][providerAttr]}`);
                    });
                    context.print.info('--------------');
                    context.print.info('');
                });
                context.print.info('');
            });
        }
        else {
            const allEnvs = context.amplify.getAllEnvs();
            if (context.parameters.options.json) {
                context.print.fancy(JSON.stringify({ envs: allEnvs }, null, 4));
                return;
            }
            const { table } = context.print;
            const tableOptions = [['Environments']];
            for (let i = 0; i < allEnvs.length; i += 1) {
                if (allEnvs[i] === envName) {
                    tableOptions.push([`*${allEnvs[i]}`]);
                }
                else {
                    tableOptions.push([allEnvs[i]]);
                }
            }
            context.print.info('');
            table(tableOptions, { format: 'markdown' });
            context.print.info('');
        }
    }),
};
//# sourceMappingURL=../../../src/lib/commands/env/list.js.map