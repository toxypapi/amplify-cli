"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamActions = {
    identifyText: 'rekognition:DetectText',
    identifyLabels: 'rekognition:DetectLabels',
    translateText: 'translate:TranslateText',
};
exports.iamLambdaActions = ['convertTextToSpeech'];
exports.allowedActions = {
    identifyText: {
        next: ['translateText'],
    },
    identifyLabels: {
        next: ['translateText', 'convertTextToSpeech'],
    },
    translateText: {
        next: ['convertTextToSpeech'],
    },
    convertTextToSpeech: {
        next: [],
    },
};
//# sourceMappingURL=predictions_utils.js.map