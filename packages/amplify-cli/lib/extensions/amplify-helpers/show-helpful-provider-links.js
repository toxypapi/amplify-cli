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
const { getResourceStatus } = require('./resource-status');
const { getProviderPlugins } = require('./get-provider-plugins');
function showHelpfulProviderLinks(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { providers } = getProjectConfig();
        const providerPlugins = getProviderPlugins(context);
        const providerPromises = [];
        const { allResources } = yield getResourceStatus();
        providers.forEach(providerName => {
            const pluginModule = require(providerPlugins[providerName]);
            providerPromises.push(pluginModule.showHelpfulLinks(context, allResources));
        });
        return Promise.all(providerPromises);
    });
}
module.exports = {
    showHelpfulProviderLinks,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/show-helpful-provider-links.js.map