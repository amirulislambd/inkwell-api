"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginationSortingHelper = (options) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = options.sortBy || "createdAt";
    const orderBy = options.orderBy || "desc";
    return {
        page,
        limit,
        skip,
        sortBy,
        orderBy,
    };
};
exports.default = paginationSortingHelper;
