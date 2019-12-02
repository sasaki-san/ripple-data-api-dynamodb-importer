export interface IItem { }

export interface IDbUnl {
    host: string
    validator_public_key: string
    created: string
    last_updated: string
}

export interface IDbValidator {
    validator_public_key: string
    domain: string
}

export interface IRippleDataApiResponseBase {
    "result": "success" | "?"
    "count": number,
}

export interface IRippleDataApiManifestsResponse extends IRippleDataApiResponseBase {
    "manifests": {
        "count": number,
        "ephemeral_public_key": string,
        "first_datetime": string,
        "last_datetime": string,
        "master_public_key": string,
        "master_signature": string,
        "sequence": string,
        "signature": string
    }[]
}

export interface IRippleDataApiValidatorDailyReportsResponse extends IRippleDataApiResponseBase {
    "reports": {
        "validation_public_key": string
        "date": string
        "chain": string
        "score": string
        "total": string
        "missed": string
        "incomplete": boolean
    }[]
}