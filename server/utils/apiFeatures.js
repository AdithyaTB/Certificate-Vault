class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        if (this.queryString.q) {
            const keyword = this.queryString.q;
            this.query = this.query.find({
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { tags: { $regex: keyword, $options: 'i' } },
                ],
            });
        }
        return this;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
        excludedFields.forEach((el) => delete queryObj[el]);

        if (queryObj.category) {
            this.query = this.query.find({ category: queryObj.category });
        }

        if (queryObj.folder) {
            this.query = this.query.find({ folder: queryObj.folder });
        }

        // Issuer partial match (case-insensitive)
        if (queryObj.issuer) {
            this.query = this.query.find({ issuer: { $regex: queryObj.issuer, $options: 'i' } });
        }

        // Tag filter – certificate must include the given tag (array field)
        if (queryObj.tag) {
            this.query = this.query.find({ tags: { $regex: queryObj.tag, $options: 'i' } });
        }

        // Issue date range
        if (queryObj.dateFrom || queryObj.dateTo) {
            const dateFilter = {};
            if (queryObj.dateFrom) dateFilter.$gte = new Date(queryObj.dateFrom);
            if (queryObj.dateTo) dateFilter.$lte = new Date(queryObj.dateTo);
            this.query = this.query.find({ issueDate: dateFilter });
        }

        // File type filter  e.g. fileType=pdf or fileType=image
        if (queryObj.fileType) {
            if (queryObj.fileType === 'pdf') {
                this.query = this.query.find({ fileType: { $regex: 'pdf', $options: 'i' } });
            } else if (queryObj.fileType === 'image') {
                this.query = this.query.find({ fileType: { $in: ['jpg', 'jpeg', 'png', 'webp', 'gif'] } });
            }
        }

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // Handle predefined sort keys mapped from frontend
            if (sortBy === 'name_asc') this.query = this.query.sort('title');
            else if (sortBy === 'name_desc') this.query = this.query.sort('-title');
            else if (sortBy === 'date_desc') this.query = this.query.sort('-createdAt');
            else if (sortBy === 'date_asc') this.query = this.query.sort('createdAt');
            else if (sortBy === 'size_desc') this.query = this.query.sort('-size');
            else if (sortBy === 'size_asc') this.query = this.query.sort('size');
            else this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
