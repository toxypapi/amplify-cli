"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("../");
var schema_1 = require("../schema");
var velocity_1 = require("../velocity");
var type_definition_1 = require("../type-definition");
jest.mock('../schema');
jest.mock('../velocity');
var generateResolversMock = schema_1.generateResolvers;
var VelocityTemplateMock = velocity_1.VelocityTemplate;
describe('AmplifyAppSyncSimulator', function () {
    var simulator;
    var baseConfig;
    beforeEach(function () {
        var schema = "type Query {\n      noop: String\n    }";
        simulator = new __1.AmplifyAppSyncSimulator();
        baseConfig = {
            appSync: {
                defaultAuthenticationType: { authenticationType: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.API_KEY },
                name: 'test',
                apiKey: 'fake-api-key',
                additionalAuthenticationProviders: [],
            },
            schema: {
                content: schema,
            },
            mappingTemplates: [],
        };
    });
    it('should support accept minimal configuration', function () {
        generateResolversMock.mockReturnValueOnce('MOCK SCHEMA');
        expect(function () { return simulator.init(baseConfig); }).not.toThrowError();
        expect(simulator.schema).toEqual('MOCK SCHEMA');
        expect(schema_1.generateResolvers).toHaveBeenCalled();
        expect(simulator.appSyncConfig);
    });
    it('should retain the original configuration when config has error', function () {
        var resolver = {
            fieldName: 'echo',
            typeName: 'Query',
            kind: type_definition_1.RESOLVER_KIND.UNIT,
            requestMappingTemplateLocation: 'missing/Resolver.req.vtl',
            responseMappingTemplateLocation: 'missing/Resolver.resp.vtl',
        };
        var configWithError = __assign(__assign({}, baseConfig), { resolvers: [resolver] });
        var oldConfig = simulator.config;
        expect(function () { return simulator.init(configWithError); }).toThrowError();
        expect(simulator.config).toStrictEqual(oldConfig);
    });
    describe('mapping templates', function () {
        it('should support mapping template', function () {
            var mappingTemplate = {
                path: 'path/to/template.vtl',
                content: 'Foo bar baz',
            };
            baseConfig.mappingTemplates = [mappingTemplate];
            expect(function () { return simulator.init(baseConfig); }).not.toThrowError();
            expect(velocity_1.VelocityTemplate).toHaveBeenCalledWith(mappingTemplate, simulator);
            expect(simulator.getMappingTemplate(mappingTemplate.path)).toBeInstanceOf(VelocityTemplateMock);
            expect(function () { return simulator.getMappingTemplate('missing/path'); }).toThrowError();
        });
        it('should normalize windows style path to unix path', function () {
            var mappingTemplate = {
                path: 'path\\to\\template.vtl',
                content: 'Foo bar baz',
            };
            var normalizedPath = 'path/to/template.vtl';
            baseConfig.mappingTemplates = [mappingTemplate];
            expect(function () { return simulator.init(baseConfig); }).not.toThrowError();
            expect(velocity_1.VelocityTemplate).toHaveBeenCalledWith(__assign(__assign({}, mappingTemplate), { path: normalizedPath }), simulator);
            expect(simulator.getMappingTemplate(normalizedPath)).toBeInstanceOf(VelocityTemplateMock);
            expect(function () { return simulator.getMappingTemplate(mappingTemplate.path); }).toThrowError('Missing mapping template');
        });
        it('should handle templates when path is missing', function () {
            var mappingTemplate = {
                content: 'Foo bar baz',
            };
            baseConfig.mappingTemplates = [mappingTemplate];
            expect(function () { return simulator.init(baseConfig); }).not.toThrowError();
            expect(velocity_1.VelocityTemplate).toHaveBeenCalledWith(mappingTemplate, simulator);
        });
    });
});
//# sourceMappingURL=index.test.js.map