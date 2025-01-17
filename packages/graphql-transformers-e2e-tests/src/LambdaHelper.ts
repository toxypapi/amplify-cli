import { Lambda } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

export class LambdaHelper {
  client: Lambda;
  constructor(region: string = 'us-west-2') {
    this.client = new Lambda({
      region,
    });
  }

  async createFunction(name: string, roleArn: string, filePrefix: string) {
    const filePath = path.join(__dirname, 'testfunctions', `${filePrefix}.zip`);
    console.log(`Uploading lambda from path: ${filePath}`);
    const zipContents = fs.readFileSync(filePath);
    return await this.client
      .createFunction({
        FunctionName: name,
        Code: {
          ZipFile: zipContents,
        },
        Runtime: 'nodejs12.x',
        Handler: `${filePrefix}.handler`,
        Role: roleArn,
      })
      .promise();
  }

  async deleteFunction(name: string) {
    return await this.client.deleteFunction({ FunctionName: name }).promise();
  }
}
