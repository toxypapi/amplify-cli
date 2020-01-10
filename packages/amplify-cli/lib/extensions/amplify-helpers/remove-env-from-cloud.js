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
const { getProjectConfig } = require('./get-project-config');
const { getCategoryPlugins } = require('./get-category-plugins');
const { getProviderPlugins } = require('./get-provider-plugins');
function removeEnvFromCloud(context, envName, deleteS3) {
    return __awaiter(this, void 0, void 0, function* () {
        const { providers } = getProjectConfig();
        const providerPlugins = getProviderPlugins(context);
        const providerPromises = [];
        context.print.info('');
        context.print.info(`Deleting env:${envName}`);
        providers.forEach(providerName => {
            const pluginModule = require(providerPlugins[providerName]);
            providerPromises.push(pluginModule.deleteEnv(context, envName, deleteS3));
        });
        try {
            yield Promise.all(providerPromises);
        }
        catch (e) {
            context.print.info('');
            context.print.error(`Error in deleting env:${envName}`);
            context.print.info(e.message);
            throw e;
        }
        const categoryPlugins = getCategoryPlugins(context);
        if (categoryPlugins.notifications) {
            const notificationsModule = require(categoryPlugins.notifications);
            yield notificationsModule.deletePinpointAppForEnv(context, envName);
        }
    });
}
module.exports = {
    removeEnvFromCloud,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/remove-env-from-cloud.js.map