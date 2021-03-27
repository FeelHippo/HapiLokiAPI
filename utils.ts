import * as Loki from 'lokijs';

export const loadCollection = (colName, db: Loki): Promise<Loki.Collection<any>> => {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        })
    })
}

export const fileFilter = (filename: string) => {
    // accept pdf only, might change in the future
    if (!filename.match(/\.pdf$/)) throw new Error('File Type Not Supported')
    return true
}