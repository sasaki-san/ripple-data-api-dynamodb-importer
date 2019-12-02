import * as dns from "dns";
import * as rp from "request-promise"
import { delay } from "./utils";

const ipstackToken = process.env.IPSTACK_TOKEN

interface IIPStackResponse {
    ip: string;
    continent_code: string;
    continent_name: string;
    country_code: string;
    country_name: string;
    region_code: string;
    region_name: string;
    city: string;
    latitude: number;
    longitude: number;
}

const dnsLookup = async (hostName: string) => {
    return new Promise((resolve, reject) => {
        dns.lookup(hostName, (err) => {
            if (err) {
                reject(err)
            }
            resolve(true)
        })
    })
}

/**
 * returns an array of domain chunks by splitting it with '/' and reversing the elements.
 * e.g. "ripple.com" -> ['com', 'ripple']
 */
const reverseSplit = (domain: string) => {
    const trimIndex = domain.indexOf("/");
    return domain
        .slice(0, trimIndex >= 0 ? trimIndex : domain.length)
        .split(".")
        .reverse();
};

/**
 * returns a string by concatenating the given domain chunk in a reverse order
 * e.g. ['com', 'ripple'] -> "ripple.com"
 */
const reverseJoin = (domainChunks: string[]) => {
    return domainChunks
        .slice()
        .reverse()
        .join(".");
};

const getGeoData = async (domainOrIp: string): Promise<IIPStackResponse> => {
    await delay(200)
    const url = `http://api.ipstack.com/${domainOrIp}?access_key=${ipstackToken}`;
    return rp.get(url, { json: true })
};

const getGeoDataWithCountryCode = (domainOrIp: string) => {
    console.log(`trying with ${domainOrIp}`)
    return new Promise<IIPStackResponse>((resolve, reject) =>
        getGeoData(domainOrIp).then(res =>
            res && res.country_code ? resolve(res) : reject(`no country code found`)
        )
    );
};

const resolveIpFromDomain = async (domain: string) => {
    return dnsLookup(domain)
};

export const getLocationData = async (domain: string) => {
    const reverseSplited = reverseSplit(domain);
    const domainChunks = [];
    let res: IIPStackResponse | void;

    for (let i = 0; i < reverseSplited.length; i++) {
        domainChunks.push(reverseSplited[i]);
        if (i > 0) {
            const partialDomain = reverseJoin(domainChunks);
            console.log(`trying to get geo data for ${partialDomain}...`)
            // try to find the domain
            res = await getGeoDataWithCountryCode(partialDomain).catch(() =>
                // if not found, then try with ip
                resolveIpFromDomain(partialDomain)
                    .then(getGeoDataWithCountryCode)
                    .catch(err => console.log(err))
            );

            if (res) {
                break;
            }
        }
    }

    if (!res) {
        console.log(`...couldn't get the geo data for ${domain}`)
        throw Error(`couldn't get the geo data for ${domain}`);
    }

    return res;
};
