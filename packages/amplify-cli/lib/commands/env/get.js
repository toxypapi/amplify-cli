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
    name: 'get',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const envName = context.parameters.options.name;
        if (!envName) {
            context.print.error('You must pass in the name of the environment using the --name flag');
            process.exit(1);
        }
        let envFound = false;
        const allEnvs = context.amplify.getEnvDetails();
        if (context.parameters.options.json) {
            if (allEnvs[envName]) {
                context.print.fancy(JSON.stringify(allEnvs[envName], null, 4));
            }
            else {
                context.print.fancy(JSON.stringify({ error: `No environment found with name: '${envName}'` }, null, 4));
            }
            return;
        }
        Object.keys(allEnvs).forEach(env => {
            if (env === envName) {
                envFound = true;
                context.print.info('');
                context.print.info(chalk.red(env));
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
            }
        });
        if (!envFound) {
            context.print.error('No environment found with the corresponding name provided');
        }
    }),
};
//# sourceMappingURL=../../../src/lib/commands/env/get.js.map