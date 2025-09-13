import { Model } from 'mongoose';
import QueryBuilder from './QueryBuilder';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

/**
 * Reusable function to run queries with QueryBuilder
 * @param model - Mongoose model (e.g., User)
 * @param query - request query (req.query)
 * @param searchableFields - fields allowed in search (e.g., ["title", "slug"])
 * @param exclude - fields to always exclude (default: "-password")
 */

async function runQueryBuilder<T>(
  model: Model<T>,
  query: Record<string, string>,
  searchableFields: string[] = [],
  exclude = '-password', // ✅ default ensures it's always a string
): Promise<PaginatedResponse<T>> {
  const queryBuilder = new QueryBuilder(model.find(), query);

  if (searchableFields.length > 0) {
    queryBuilder.search(searchableFields);
  }

  queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build().select(exclude),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
}

export default runQueryBuilder;
