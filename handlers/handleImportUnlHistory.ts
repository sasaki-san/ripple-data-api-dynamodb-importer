import UnlHelper from "../modules/UnlHelper"
import DBHelper from "../modules/DBHelper";
import * as Octokit from "@octokit/rest";
import * as rp from "request-promise"
const tableName = process.env.DYNAMODB_UNLHISTORY_TABLE
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_TOKEN });

const dateRegexp = new RegExp(/index\.([\d-]{1,})\.json/);
const fileNameRegexp = new RegExp(/^index\..*\.json$/);

type UnlEntry = {
    id: string
    date: Date
    url: string
}

const isDefaultUnlFile = (file: any) => {
    return !!fileNameRegexp.exec(file.name)
}

const getDate = (file) => {
    try {
        const match = dateRegexp.exec(file.name)
        return new Date(match[1])
    } catch {
        return null;
    }
}

const getUnlEntries = async () => {
    const data = await octokit.repos.getContents({
        owner: "ripple",
        repo: "vl",
        path: ""
    }).then(res => res.data) as any[];
    const unlEntries: UnlEntry[] = data.filter(isDefaultUnlFile).map(file => ({
        id: file.name,
        date: getDate(file),
        url: file.download_url
    }));
    return unlEntries
}

const getUnl = async (unlEntry: UnlEntry) => {
    const response = await rp.get(unlEntry.url, { json: true })
    const unl = UnlHelper.parseUnl(response.blob)
    return unl.map(validator_public_key => ({
        date: unlEntry.date.toISOString(),
        validator_public_key,
        created: new Date().toISOString()
    }))
}

const handle = async () => {
    const unlEntries = await getUnlEntries()
    let history = []
    for (let unlEntry of unlEntries) {
        console.log(`Getting ${unlEntry.url}...`)
        try {
            const data = await getUnl(unlEntry)
            history = history.concat(data)
        } catch {
            console.log(`${unlEntry.url} failed`)
        }
    }
    const putRequestMapper = (item) => ({ Item: item })
    await DBHelper.insertBatch(tableName, history, putRequestMapper)
}

export default handle