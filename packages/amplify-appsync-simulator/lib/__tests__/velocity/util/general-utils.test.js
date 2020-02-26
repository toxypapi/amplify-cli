"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../../velocity/util/index");
var map_1 = require("../../../velocity/value-mapper/map");
var stubInfo = {
    fieldName: 'testFieldName',
    path: {
        prev: null,
        key: 'pathKey',
    },
    fieldNodes: [],
    operation: {
        selectionSet: {
            selections: [
                {
                    name: {
                        value: 'someOtherField',
                    },
                },
                {
                    name: {
                        value: 'testFieldName',
                    },
                    selectionSet: {
                        selections: [
                            {
                                name: {
                                    value: 'field1',
                                },
                            },
                            {
                                name: {
                                    value: 'field2',
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
};
var mockInfo = stubInfo;
var stubJavaMap = new map_1.JavaMap({ field1: 'field1Value', field2: 'field2Value', field3: 'field3Value' }, function (x) { return x; });
var util;
beforeEach(function () {
    util = index_1.create(undefined, undefined, mockInfo);
});
it('error_filterDataJavaMap', function () {
    expect(function () { return util.error('test message', 'ERROR_TYPE', stubJavaMap); }).toThrow();
    expect(util.errors.length).toBe(1);
    expect(util.errors[0].data).toStrictEqual({ field1: 'field1Value', field2: 'field2Value' });
});
it('appendError_filterDataJavaMap', function () {
    util.appendError('test message', 'ERROR_TYPE', stubJavaMap);
    expect(util.errors.length).toBe(1);
    expect(util.errors[0].data).toStrictEqual({ field1: 'field1Value', field2: 'field2Value' });
});
//# sourceMappingURL=general-utils.test.js.map