import Output from 'cloudform-types/types/output';
import Template from 'cloudform-types/types/template';
import { StringParameter, NumberParameter } from 'cloudform-types';
import { Expression } from 'graphql-mapping-template';
import { MappingParameters } from 'graphql-transformer-core/src/TransformerContext';
export declare class ResourceFactory {
    makeParams(): {
        [x: string]: StringParameter | NumberParameter;
    };
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(): Template;
    /**
     * Given the name of a data source and optional logical id return a CF
     * spec for a data source pointing to the elasticsearch domain.
     * @param name The name for the data source. If a logicalId is not provided the name is used.
     * @param logicalId The logicalId of the domain if it is different than the name of the data source.
     */
    makeElasticsearchDataSource(): import("cloudform-types/types/appSync/dataSource").default;
    getLayerMapping(): MappingParameters;
    /**
     * Deploy a lambda function that will stream data from our DynamoDB table
     * to our elasticsearch index.
     */
    makeDynamoDBStreamingFunction(): import("cloudform-types/types/lambda/function").default;
    makeDynamoDBStreamEventSourceMapping(typeName: string): import("cloudform-types/types/lambda/eventSourceMapping").default;
    private joinWithEnv;
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    makeElasticsearchAccessIAMRole(): import("cloudform-types/types/iam/role").default;
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    makeStreamingLambdaIAMRole(): import("cloudform-types/types/iam/role").default;
    /**
     * If there is an env, allow ES to create the domain name so we don't go
     * over 28 characters. If there is no env, fallback to original behavior.
     */
    private domainName;
    private domainArn;
    /**
     * Create the elasticsearch domain.
     */
    makeElasticsearchDomain(): import("cloudform-types/types/elasticsearch/domain").default;
    /**
     * Create the Elasticsearch search resolver.
     */
    makeSearchResolver(type: string, nonKeywordFields: Expression[], primaryKey: string, queryTypeName: string, nameOverride?: string): import("cloudform-types/types/appSync/resolver").default;
    /**
     * OUTPUTS
     */
    /**
     * Create output to export the Elasticsearch DomainArn
     * @returns Output
     */
    makeDomainArnOutput(): Output;
    /**
     * Create output to export the Elasticsearch DomainEndpoint
     * @returns Output
     */
    makeDomainEndpointOutput(): Output;
}
