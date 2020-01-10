import { S3 } from 'aws-sdk';
export declare class S3Client {
    region: string;
    client: S3;
    constructor(region: string);
    createBucket(bucketName: string): Promise<S3.CreateBucketOutput>;
    putBucketVersioning(bucketName: string): Promise<{}>;
    uploadZIPFile(bucketName: string, filePath: string, s3key: string, contentType?: string): Promise<S3.PutObjectOutput>;
    uploadFile(bucketName: string, filePath: string, s3key: string): Promise<S3.PutObjectOutput>;
    getFileVersion(bucketName: string, s3key: string): Promise<S3.GetObjectOutput>;
    getAllObjectVersions(bucketName: string): Promise<S3.ListObjectVersionsOutput>;
    deleteObjectVersion(bucketName: string, versionId: string, s3key: string): Promise<S3.DeleteObjectOutput>;
    deleteFile(bucketName: string, s3key: string): Promise<void>;
    deleteBucket(bucketName: string): Promise<{}>;
    setUpS3Resources(bucketName: string, filePath: string, s3key: string, zip?: boolean): Promise<S3.GetObjectOutput>;
    cleanUpS3Resources(bucketName: string, s3key: string): Promise<void>;
    private readFile;
    private readZIPFile;
    wait<T>(secs: number, fun: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T>;
}
