export declare const iamActions: {
    identifyText: string;
    identifyLabels: string;
    translateText: string;
};
export declare const iamLambdaActions: string[];
export declare const allowedActions: {
    identifyText: {
        next: string[];
    };
    identifyLabels: {
        next: string[];
    };
    translateText: {
        next: string[];
    };
    convertTextToSpeech: {
        next: any[];
    };
};
