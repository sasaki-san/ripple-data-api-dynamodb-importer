import DBHelper from "../modules/DBHelper";
import * as rp from "request-promise"
import { IDbValidator, IRippleDataApiManifestsResponse } from "../types";
import { delay } from "../modules/utils";
const validatorTableName = process.env.DYNAMODB_VALIDATOR_TABLE
const manifestTableName = process.env.DYNAMODB_MANIFEST_TABLE

const url = (validator_public_key: string) => `https://data.ripple.com/v2/network/validators/${validator_public_key}/manifests`

const transform = (data: IRippleDataApiManifestsResponse, validator_public_key: string) => {
    const lastManifest = data.manifests[0]
    return [{
        ...lastManifest,
        validator_public_key
    }]
}

const handle = async () => {
    const validators = await DBHelper.scan<IDbValidator>(validatorTableName)
    const putRequestMapper = (item) => ({ Item: item })
    for (let validator of validators) {
        const response: IRippleDataApiManifestsResponse = await rp.get(url(validator.validator_public_key), { json: true })
        const manifests = transform(response, validator.validator_public_key)
        await DBHelper.insertBatch(manifestTableName, manifests, putRequestMapper)
        await delay(500)
    }
}

export default handle