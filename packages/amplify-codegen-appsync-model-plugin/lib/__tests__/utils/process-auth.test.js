"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_auth_1 = require("../../utils/process-auth");
const buildAuthDirective = (authRule) => {
    return {
        name: 'auth',
        arguments: {
            rules: [authRule],
        },
    };
};
describe('process auth directive', () => {
    let ownerAuthRule;
    beforeEach(() => {
        ownerAuthRule = {
            allow: process_auth_1.AuthStrategy.owner,
        };
    });
    describe('Owner auth', () => {
        it('should add default owner field when owner auth is missing ownerField', () => {
            ownerAuthRule.identityClaim = 'owner';
            ownerAuthRule.operations = [process_auth_1.AuthModelOperation.read];
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { ownerField: 'owner' }));
        });
        it('should add default identityClaim cognito:userName if the directive is missing it', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.operations = [process_auth_1.AuthModelOperation.read];
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { identityClaim: 'cognito:username' }));
        });
        it('should change identityClaim to cognito:userName when its username', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.operations = [process_auth_1.AuthModelOperation.read];
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            ownerAuthRule.identityClaim = 'username';
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { identityClaim: 'cognito:username' }));
        });
        it('should change identityField to identityClaim', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.operations = [process_auth_1.AuthModelOperation.read];
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            ownerAuthRule.identityField = 'username';
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { identityClaim: 'cognito:username' }));
        });
        it('should add operations when its missing', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            ownerAuthRule.identityClaim = 'user_name';
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { operations: [process_auth_1.AuthModelOperation.create, process_auth_1.AuthModelOperation.update, process_auth_1.AuthModelOperation.delete] }));
        });
        it('should use deprecated mutation field value for operations', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.provider = process_auth_1.AuthProvider.userPools;
            ownerAuthRule.identityClaim = 'user_name';
            ownerAuthRule.mutations = [process_auth_1.AuthModelMutation.delete];
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { operations: [process_auth_1.AuthModelMutation.delete] }));
        });
        it('should add provider when its missing', () => {
            ownerAuthRule.ownerField = 'username';
            ownerAuthRule.operations = [process_auth_1.AuthModelOperation.create, process_auth_1.AuthModelOperation.update, process_auth_1.AuthModelOperation.delete];
            ownerAuthRule.identityClaim = 'user_name';
            const directives = [buildAuthDirective(ownerAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, ownerAuthRule), { provider: process_auth_1.AuthProvider.userPools }));
        });
    });
    describe('Group auth', () => {
        let groupsAuthRule;
        beforeEach(() => {
            groupsAuthRule = {
                allow: process_auth_1.AuthStrategy.groups,
            };
        });
        it('should filter dynamic group auth rule', () => {
            groupsAuthRule.groupField = 'my-group';
            const directives = [buildAuthDirective(groupsAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules).toHaveLength(0);
        });
        it('should add groupClaim field when its missing', () => {
            groupsAuthRule.provider = process_auth_1.AuthProvider.oidc;
            groupsAuthRule.groups = ['Foo'];
            groupsAuthRule.operations = [process_auth_1.AuthModelOperation.update];
            const directives = [buildAuthDirective(groupsAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, groupsAuthRule), { groupClaim: 'cognito:groups' }));
        });
        it('should add provider field when its missing', () => {
            groupsAuthRule.groupClaim = 'my:groups';
            groupsAuthRule.groups = ['Foo'];
            groupsAuthRule.operations = [process_auth_1.AuthModelOperation.update];
            const directives = [buildAuthDirective(groupsAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, groupsAuthRule), { provider: process_auth_1.AuthProvider.userPools }));
        });
        it('should add default operations when its missing', () => {
            groupsAuthRule.groupClaim = 'my:groups';
            groupsAuthRule.groups = ['Foo'];
            groupsAuthRule.provider = process_auth_1.AuthProvider.userPools;
            const directives = [buildAuthDirective(groupsAuthRule)];
            const processedAuthDirective = process_auth_1.processAuthDirective(directives);
            expect(processedAuthDirective[0].arguments.rules[0]).toEqual(Object.assign(Object.assign({}, groupsAuthRule), { operations: [process_auth_1.AuthModelOperation.create, process_auth_1.AuthModelOperation.update, process_auth_1.AuthModelOperation.delete] }));
        });
    });
});
//# sourceMappingURL=process-auth.test.js.map