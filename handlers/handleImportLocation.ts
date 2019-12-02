import DBHelper from "../modules/DBHelper";
import * as LocationHelper from "../modules/LocationHelper"
import { IDbValidator } from "../types";
const validatorTableName = process.env.DYNAMODB_VALIDATOR_TABLE
const locationTableName = process.env.DYNAMODB_LOCATION_TABLE

const handle = async () => {

    const validators = await DBHelper.scan<IDbValidator>(validatorTableName)
    const domains = [...new Set(validators.map(v => v.domain))]
    const locations = []
    for (let domain of domains) {
        if (domain) {
            try {
                const location = await LocationHelper.getLocationData(domain)
                locations.push({
                    ...location,
                    domain,
                })
            } catch (err) {
                console.log(err)
            }
        }
    }

    const putRequestMapper = (item) => ({ Item: item })
    await DBHelper.insertBatch(locationTableName, locations, putRequestMapper)
}

export default handle