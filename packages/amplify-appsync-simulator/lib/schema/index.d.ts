import { Source } from 'graphql';
import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorBaseResolverConfig } from '../type-definition';
import { AppSyncSimulatorDirectiveBase } from './directives/directive-base';
export declare function generateResolvers(schema: Source, resolversConfig: AppSyncSimulatorBaseResolverConfig[], simulatorContext: AmplifyAppSyncSimulator): import("graphql").GraphQLSchema;
export declare function addDirective(name: string, visitor: typeof AppSyncSimulatorDirectiveBase): void;
