import { S3Client } from './S3Client';
import { CloudFormationClient } from './CloudFormationClient';
import { DeploymentResources } from 'graphql-transformer-core/lib/DeploymentResources';
export declare function cleanupS3Bucket(s3Client: S3Client, buildPath: string, bucketName: string, rootKey: string, buildTimestamp: string): Promise<void>;
export declare function deploy(s3Client: S3Client, cf: CloudFormationClient, stackName: string, deploymentResources: DeploymentResources, params: any, buildPath: string, bucketName: string, rootKey: string, buildTimeStamp: string): Promise<import("aws-sdk/clients/cloudformation").Stack>;
