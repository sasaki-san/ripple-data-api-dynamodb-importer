import { DynamoDB } from "aws-sdk"
import { PutRequest } from "aws-sdk/clients/dynamodb"
import { delay } from "./utils"
import { IItem } from "../types"
const dynamoDb = new DynamoDB.DocumentClient()
const dynamoDbMaxPutThreshold = 25

export default class DBHelper {

    static scan = async <T extends IItem>(tableName: string) => {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: tableName
        }
        const data = await dynamoDb.scan(params).promise()
        return data.Items as T[]
    }

    static insertBatch = async <T extends IItem>(tableName: string, items: T[], putRequestMapper: <T>(item: T) => { Item: T }) => {
        // bulk insert one batch (<= 25 items) at a time, 
        // and wait for 500 ms before inserting the next batch
        for (let i = 0; i < items.length; i += dynamoDbMaxPutThreshold) {
            const batch = items.slice(i, i + dynamoDbMaxPutThreshold)
            const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
                RequestItems: {
                    [tableName]: batch.map(d => ({
                        PutRequest: putRequestMapper(d) as any as PutRequest
                    }))
                }
            }
            await dynamoDb.batchWrite(params).promise()
            await delay(500)
        }
    }

}