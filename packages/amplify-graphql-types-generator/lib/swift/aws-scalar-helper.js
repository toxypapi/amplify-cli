"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsScalarMap = {
    AWSDate: 'String',
    AWSTime: 'String',
    AWSDateTime: 'String',
    AWSTimestamp: 'Int',
    AWSEmail: 'String',
    AWSJSON: 'String',
    AWSURL: 'String',
    AWSPhone: 'String',
    AWSIPAddress: 'String',
};
function getTypeForAWSScalar(type) {
    return exports.awsScalarMap[type.name];
}
exports.getTypeForAWSScalar = getTypeForAWSScalar;
//# sourceMappingURL=aws-scalar-helper.js.map