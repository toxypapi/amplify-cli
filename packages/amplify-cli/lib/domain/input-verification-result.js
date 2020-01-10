"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InputVerificationResult {
    constructor(verified = false, helpCommandAvailable = false, message = undefined) {
        this.verified = verified;
        this.helpCommandAvailable = helpCommandAvailable;
        this.message = message;
    }
}
exports.InputVerificationResult = InputVerificationResult;
//# sourceMappingURL=../../src/lib/domain/input-verification-result.js.map