export const processCollection = (collection, req) => {
    const { _page, _limit, _sort, _order, _per_page, ...filters } = req.query;
    let results = [...collection];
    Object.keys(filters).forEach((key) => {
        results = results.filter((item) => {
            if (key.endsWith('_like')) {
                const actualKey = key.replace('_like', '');
                const filterValue = filters[key];
                return filterValue
                    ? String(item[actualKey]).toLowerCase().includes(String(filterValue).toLowerCase())
                    : true;
            }
            const filterValue = filters[key];
            return filterValue ? String(item[key]) === String(filterValue) : true;
        });
    });
    if (_sort) {
        const order = _order === 'desc' ? -1 : 1;
        results.sort((a, b) => {
            if (a[_sort] < b[_sort]) {
                return -1 * order;
            }
            if (a[_sort] > b[_sort]) {
                return 1 * order;
            }
            return 0;
        });
    }
    const page = _page ? parseInt(_page) : 1;
    const LIMIT = _per_page ?? _limit;
    const limit = LIMIT ? parseInt(LIMIT) : results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalCount = results.length;
    return {
        data: results.slice(startIndex, endIndex),
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit)
    };
};
export default processCollection;
//# sourceMappingURL=processCollection.js.map