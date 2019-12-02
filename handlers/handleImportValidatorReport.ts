import DBHelper from "../modules/DBHelper";
import * as rp from "request-promise"
import { IDbValidator, IRippleDataApiValidatorDailyReportsResponse } from "../types";
import { delay, omitKey } from "../modules/utils";
const validatorTableName = process.env.DYNAMODB_VALIDATOR_TABLE
const validatorReportTableName = process.env.DYNAMODB_VALIDATORREPORT_TABLE

const url = (validator_public_key: string) => `https://data.ripple.com/v2/network/validators/${validator_public_key}/reports?format=json`

const transform = (response: IRippleDataApiValidatorDailyReportsResponse, validator_public_key: string) => {
    return response.reports.map(report => omitKey({
        ...report,
        validator_public_key
    }, "validation_public_key"))
}

const handle = async () => {
    const validators = await DBHelper.scan<IDbValidator>(validatorTableName)
    const putRequestMapper = (item) => ({ Item: item })
    for (let validator of validators) {
        const response: IRippleDataApiValidatorDailyReportsResponse = await rp.get(url(validator.validator_public_key), { json: true })
        const reports = transform(response, validator.validator_public_key)
        await DBHelper.insertBatch(validatorReportTableName, reports, putRequestMapper)
        await delay(500)
    }
}

export default handle