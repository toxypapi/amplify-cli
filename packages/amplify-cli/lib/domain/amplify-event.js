"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AmplifyEvent;
(function (AmplifyEvent) {
    AmplifyEvent["PreInit"] = "PreInit";
    AmplifyEvent["PostInit"] = "PostInit";
    AmplifyEvent["PrePush"] = "PrePush";
    AmplifyEvent["PostPush"] = "PostPush";
})(AmplifyEvent = exports.AmplifyEvent || (exports.AmplifyEvent = {}));
class AmplifyEventData {
}
exports.AmplifyEventData = AmplifyEventData;
class AmplifyPreInitEventData extends AmplifyEventData {
}
exports.AmplifyPreInitEventData = AmplifyPreInitEventData;
class AmplifyPostInitEventData extends AmplifyEventData {
}
exports.AmplifyPostInitEventData = AmplifyPostInitEventData;
class AmplifyPrePushEventData extends AmplifyEventData {
}
exports.AmplifyPrePushEventData = AmplifyPrePushEventData;
class AmplifyPostPushEventData extends AmplifyEventData {
}
exports.AmplifyPostPushEventData = AmplifyPostPushEventData;
class AmplifyEventArgs {
    constructor(event, data) {
        this.event = event;
        this.data = data;
    }
}
exports.AmplifyEventArgs = AmplifyEventArgs;
//# sourceMappingURL=../../src/lib/domain/amplify-event.js.map