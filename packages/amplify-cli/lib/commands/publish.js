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
const pushCommand = require('./push');
module.exports = {
    name: 'publish',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        context.amplify.constructExeInfo(context);
        const { amplifyMeta } = context.exeInfo;
        const isHostingAdded = amplifyMeta.hosting && Object.keys(amplifyMeta.hosting).length > 0;
        if (!isHostingAdded) {
            context.print.info('');
            context.print.error('Please add hosting to your project before publishing your project');
            context.print.info('Command: amplify hosting add');
            context.print.info('');
            return;
        }
        let isHostingAlreadyPushed = false;
        Object.keys(amplifyMeta.hosting).every(hostingService => {
            let continueToCheckNext = true;
            if (amplifyMeta.hosting[hostingService].lastPushTimeStamp) {
                const lastPushTime = new Date(amplifyMeta.hosting[hostingService].lastPushTimeStamp);
                if (lastPushTime < Date.now()) {
                    isHostingAlreadyPushed = true;
                    continueToCheckNext = false;
                }
            }
            return continueToCheckNext;
        });
        const didPush = yield pushCommand.run(context);
        let continueToPublish = didPush;
        if (!continueToPublish && isHostingAlreadyPushed) {
            context.print.info('');
            continueToPublish = yield context.amplify.confirmPrompt.run('Do you still want to publish the frontend?');
        }
        if (continueToPublish) {
            const frontendPlugins = context.amplify.getFrontendPlugins(context);
            const frontendHandlerModule = require(frontendPlugins[context.exeInfo.projectConfig.frontend]);
            yield frontendHandlerModule.publish(context);
        }
    }),
};
//# sourceMappingURL=../../src/lib/commands/publish.js.map