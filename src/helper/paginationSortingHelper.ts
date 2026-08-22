import { ParsedQs } from "qs";

type PaginationOptions = ParsedQs & {
  page?: string;
  limit?: string;
  sortBy?: string;
  orderBy?: string;
};

const paginationSortingHelper = (options: PaginationOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const orderBy = options.orderBy || "desc";

  return { page, limit, skip, sortBy, orderBy };
};

export default paginationSortingHelper;