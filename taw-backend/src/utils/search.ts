import {Schema, Model, Query, models} from "mongoose";

function getStringAndReferencePaths(schema: Schema<any>, prefix = ""): { stringPaths: string[], refPaths: { path: string, model: string }[] } {
    let stringPaths: string[] = [];
    let refPaths: { path: string, model: string }[] = [];

    for (const path in schema.paths) {
        const fullPath = prefix ? `${prefix}.${path}` : path;
        const schemaType = schema.paths[path];

        if (schemaType.instance === "String") {
            stringPaths.push(fullPath);
        } else if (schemaType.instance === "ObjectId") {
            if (schemaType.options.ref) {
                refPaths.push({ path: fullPath, model: schemaType.options.ref });
            }
        } else if (schemaType.instance === "Embedded" || schemaType.instance === "Object") {
            const subPaths = getStringAndReferencePaths(schemaType.schema, fullPath);
            stringPaths.push(...subPaths.stringPaths);
            refPaths.push(...subPaths.refPaths);
        } else if (schemaType.instance === "Array" && schemaType.schema) {
            const subPaths = getStringAndReferencePaths(schemaType.schema, fullPath);
            stringPaths.push(...subPaths.stringPaths);
            refPaths.push(...subPaths.refPaths);
        }
    }

    return { stringPaths, refPaths };
}

async function buildReferenceConditions(refPaths: { path: string, model: string }[], searchText: string) {
    const refConditions = [];

    for (const { path, model } of refPaths) {
        if (typeof models[model] !== 'undefined') {
            const referencedModel = models[model];
            const { stringPaths } = getStringAndReferencePaths(referencedModel.schema);
            const subSearchConditions = stringPaths.map(subPath => ({
                [subPath]: { $regex: searchText, $options: "i" }
            }));

            const results = await referencedModel.find({
                $or: subSearchConditions
            }).select("_id");

            const matchingIds = results.map(result => result._id);
            if (matchingIds.length > 0) {
                refConditions.push({ [path]: { $in: matchingIds } });
            }
        }
    }

    return refConditions;
}

// Function to search across all string fields of a model, including sub-documents and references
export default async function fullTextSearch(
    model: Model<any>,
    searchText: string,
    filter: string = "",
) {
    const { stringPaths, refPaths } = getStringAndReferencePaths(model.schema);

    const searchConditions = stringPaths.map((path) => ({
        [path]: { $regex: searchText, $options: "i" },
    }));

    const query: Query<any, any, any, any, any, any> = model.find({});

    if (filter) query.select(filter);

    if (searchText) {
        query.or(searchConditions);
        const refConditions = await buildReferenceConditions(refPaths, searchText);
        query.or(refConditions);
    }

    return query.exec();
}
