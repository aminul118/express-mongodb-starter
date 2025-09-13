/* eslint-disable @typescript-eslint/no-explicit-any */
import { slugify as transliterateSlugify } from 'transliteration';
import { Schema, Model } from 'mongoose';

interface SlugOptions<T> {
  field?: keyof T; // source field (default: "title")
  slugField?: keyof T; // target field (default: "slug")
  lockSlug?: boolean; // if true, slug won’t update after creation
}

const generateSlug = <T>(schema: Schema<T>, options: SlugOptions<T> = {}) => {
  const sourceField = (options.field || 'title') as string;
  const slugField = (options.slugField || 'slug') as string;
  const lockSlug = options.lockSlug ?? false;

  const createUniqueSlug = async (doc: any, Model: Model<T>) => {
    const baseSlug = transliterateSlugify(doc.get(sourceField), {
      lowercase: true,
      separator: '-',
    });
    let slug = baseSlug;
    let counter = 1;

    while (await Model.exists({ [slugField]: slug, _id: { $ne: doc._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  };

  schema.pre('save', async function (next) {
    const doc = this as any;
    if (!doc.isModified(sourceField)) return next();
    if (lockSlug && doc[slugField]) return next();

    const Model = this.constructor as Model<T>;
    doc.set(slugField, await createUniqueSlug(doc, Model));
    next();
  });

  schema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const update = this.getUpdate() as any;
    if (!update[sourceField]) return next();
    if (lockSlug && update[slugField]) return next();

    const Model = this.model as Model<T>;
    const fakeDoc = new Model(update);
    update[slugField] = await createUniqueSlug(fakeDoc, Model);
    this.setUpdate(update);
    next();
  });
};

export default generateSlug;

/**
 ** uses this function as plugin
 * Name_Of_Mongoose_Schema.plugin(generateSlug, { field: "title", slugField: "slug", lockSlug: false });
 */
