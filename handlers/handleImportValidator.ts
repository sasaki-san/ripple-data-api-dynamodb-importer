import DBHelper from "../modules/DBHelper";
import * as rp from "request-promise"
const tableName = process.env.DYNAMODB_VALIDATOR_TABLE

const url = `https://data.ripple.com/v2/network/validators?format=json`

const transform = (data: { validators: any[] }) => {
    return data.validators.map(v => {
        v = ({
            ...v,
            validator_public_key: v.validation_public_key,
            created: new Date().toISOString()
        })
        delete v["validation_public_key"]
        return v
    });
}

const handle = async () => {
    const data = await rp.get(url, { json: true })
    const transformedData = transform(data)
    const putRequestMapper = (item) => ({ Item: item })
    await DBHelper.insertBatch(tableName, transformedData, putRequestMapper)
}

export default handle