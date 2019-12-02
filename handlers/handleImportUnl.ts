import UnlHelper from "../modules/UnlHelper"
import DBHelper from "../modules/DBHelper";
import * as rp from "request-promise"
import { IDbUnl } from "../types";
const tableName = process.env.DYNAMODB_UNLSNAPSHOT_TABLE
const unlHosts = process.env.UNL_HOSTS.split(",").map(a => a.trim())

const transform = (data: any, host: string): IDbUnl[] => {
    const result = UnlHelper.parseUnl(data.blob);
    const last_updated = new Date().toISOString();
    return result.map(validator_public_key => ({
        host,
        validator_public_key,
        created: last_updated,
        last_updated
    }));
}

const handle = async () => {
    for (let host of unlHosts) {
        console.log(`importing from ${host}`)
        const response = await rp.get(`https://${host}`, { json: true })
        const unls = transform(response, host)
        const putRequestMapper = <IDBUnlSchema>(item: IDBUnlSchema) => ({ Item: item })
        await DBHelper.insertBatch(tableName, unls, putRequestMapper)
    }
}

export default handle