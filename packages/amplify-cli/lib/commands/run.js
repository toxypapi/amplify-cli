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
module.exports = {
    name: 'run',
    alias: ['serve'],
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        context.amplify.constructExeInfo(context);
        yield context.amplify.pushResources(context);
        const frontendPlugins = context.amplify.getFrontendPlugins(context);
        const frontendHandlerModule = require(frontendPlugins[context.exeInfo.projectConfig.frontend]);
        yield frontendHandlerModule.run(context);
    }),
};
//# sourceMappingURL=../../src/lib/commands/run.js.map