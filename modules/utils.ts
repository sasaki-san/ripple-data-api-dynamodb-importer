export const delay = async (ms: number) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true)
        }, ms);
    })
}

export const omitKey = (o: any, key: string) => {
    delete o[key]
    return o;
}
