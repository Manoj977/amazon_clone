class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    search() {
        let keywword = this.queryString.keyword
            ? {
                name: {
                    $regex: this.queryString.keyword,
                    $options: "i",
                }
            } : {};
        this.query.find({ ...keywword });
        return this;
    }
    filter() {
        let queryCopy = { ...this.queryString };
        let removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key]);
        let queryStr = JSON.stringify(queryCopy); //Convert Object into JSON
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);//Replace gt, gte, lt, lte with $ 
        this.query.find(JSON.parse(queryStr));//Covert JSON into Object
        return this;
    }
    paginate(restPerPage) {
        const currPage = this.queryString.page * 1 || 1;
        const skip = (currPage - 1) * restPerPage;
        this.query = this.query.skip(skip).limit(restPerPage);
        return this;
    }
}
module.exports = APIFeatures;