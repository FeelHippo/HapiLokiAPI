export const loadCollection = (colName, db) => {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        });
    });
};
export const fileFilter = (filename) => {
    // accept pdf only, might change in the future
    if (!filename.match(/\.pdf$/))
        throw new Error('File Type Not Supported');
    return true;
};
//# sourceMappingURL=utils.js.map