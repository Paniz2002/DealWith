import {Model, models, PopulateOptions, Query, Schema} from "mongoose";
import {capitalizeFirstLetter} from "../index";

type RefPath = {
    path: string;
    model: string;
    populatePath: string;
};

function uniqueAndSortByPopulatePath(arr: RefPath[]): RefPath[] {
    const uniqueMap = new Map<string, RefPath>();

    // Remove duplicates based on populatePath
    arr.forEach((item) => {
        if (!uniqueMap.has(item.populatePath)) {
            uniqueMap.set(item.populatePath, item);
        }
    });

    // Convert the map back to an array and sort alphabetically by populatePath
    return Array.from(uniqueMap.values()).sort((a, b) => a.populatePath.localeCompare(b.populatePath));
}
async function getStringAndReferencePaths(schema: Schema<any>, prefix = "", split_prefix: boolean | string = false): Promise<{
    stringPaths: string[],
    refPaths: RefPath[]
}> {
    let stringPaths: string[] = [];
    let refPaths: { path: string, model: string, populatePath: string }[] = [];

    for (const path in schema.paths) {

        const fullPath = prefix ? `${prefix}.${path}` : path;
        const schemaType = schema.paths[path];
        let temp_prefix = fullPath.split('.').at(-2);
        if (schemaType.instance === "String") {
            stringPaths.push(fullPath);
            if (prefix) { //keep penultimate prefix
                //remove last part of the path
                let populate_path = fullPath.split('.').slice(0, -1).join('.');
                if (!temp_prefix) {
                    temp_prefix = '';
                }

                if (!split_prefix) {
                    refPaths.push({path: path, model: temp_prefix, populatePath: populate_path});
                } else {
                    console.log('ssspl', path, temp_prefix, populate_path, split_prefix + '.' + populate_path)
                    refPaths.push({path: path, model: temp_prefix, populatePath: populate_path});
                }
            }

        } else if (schemaType.instance === "ObjectId") {
            if (schemaType.options.ref) {
                const referencedModelName = schemaType.options.ref;
                let subPaths;
                if (typeof referencedModelName === 'string' && models[referencedModelName]) {
                    subPaths = await getStringAndReferencePaths(models[referencedModelName].schema, fullPath)
                    stringPaths.push(...subPaths.stringPaths);
                    refPaths.push(...subPaths.refPaths);
                } else {
                    subPaths = await getStringAndReferencePaths(referencedModelName().schema, fullPath)
                    stringPaths.push(...subPaths.stringPaths);
                    refPaths.push(...subPaths.refPaths);
                }
            }
        } else if (schemaType.instance === "Embedded" || schemaType.instance === "Object") {
            const subPaths = await getStringAndReferencePaths(schemaType.schema, fullPath);
            stringPaths.push(...subPaths.stringPaths);
            refPaths.push(...subPaths.refPaths);
        } else if (schemaType.instance === "Array" && schemaType.schema) {
            const subPaths = await getStringAndReferencePaths(schemaType.schema, fullPath);
            stringPaths.push(...subPaths.stringPaths);
            refPaths.push(...subPaths.refPaths);
        } else if (schemaType.instance === "Array") {
            let model_ref = await (schemaType as any).caster.options.ref;
            if (model_ref && model_ref.schema) {
                const subPaths = await getStringAndReferencePaths(model_ref.schema, fullPath, temp_prefix);
                refPaths.push(...subPaths.refPaths);
                stringPaths.push(...subPaths.stringPaths);
            }
        }
    }

    return {stringPaths, refPaths};
}

async function buildReferenceConditions(refPaths: RefPath[], searchText: string) {
    const refConditions = [];
    for (let {path, model} of refPaths) {
        model = capitalizeFirstLetter(model);
        if (typeof models[model] !== 'undefined') {
            const referencedModel = models[model];
            const {stringPaths} = await getStringAndReferencePaths(referencedModel.schema);
            const subSearchConditions = stringPaths.map(subPath => ({
                [subPath]: {$regex: searchText, $options: "i"}
            }));

            const results = await referencedModel.find({
                $or: subSearchConditions
            }).select("_id");

            const matchingIds = results.map(result => result._id);
            if (matchingIds.length > 0) {
                refConditions.push({[path]: {$in: matchingIds}});
            }
        }
    }

    return refConditions;
}

async function recursivePopulate(refPaths: RefPath[]): Promise<any> {
    let populatePaths: any[] = [];

    for (const ref of refPaths) {
        const pathSegments = ref.populatePath.split('.');
        let currentLevel = populatePaths;

        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];

            // Find existing path entry if it exists
            let existingPath = currentLevel.find((p: any) => p.path === segment);

            if (!existingPath) {
                // Create new path entry
                existingPath = {
                    path: segment,
                    model: i === pathSegments.length - 1 ? models[capitalizeFirstLetter(ref.model)] : undefined
                };
                currentLevel.push(existingPath);
            }

            // If we are at the last segment, assign model and prepare for possible nested populate
            if (i === pathSegments.length - 1) {
                const newRefs = refPaths.filter(subRef =>
                    subRef.populatePath.startsWith(ref.populatePath + '.')
                ).map(subRef => ({
                    ...subRef,
                    populatePath: subRef.populatePath.replace(ref.populatePath + '.', '')
                }));

                const nestedPopulate = await recursivePopulate(newRefs);
                if (nestedPopulate.length > 0) {
                    existingPath.populate = nestedPopulate;
                }
            } else {
                // Move deeper into the structure for nested populates
                if (!existingPath.populate) {
                    existingPath.populate = [];
                }
                currentLevel = existingPath.populate;
            }
        }
    }

    return populatePaths;
}


export default async function fullTextSearch(
    model: Model<any>,
    searchText: string = "",
    filter: string = "",
) {

    //region build query
    let {stringPaths, refPaths} = await getStringAndReferencePaths(model.schema);
    let searchConditions = null
    if (searchText) {
        searchConditions = stringPaths.map((path) => ({
            [path]: {$regex: searchText, $options: "i"},
        }));
    }
    let query: Query<any, any, any, any, any, any> = model.find({});
    if (filter) query.select(filter);
    //endregion


    //region populate
    refPaths=  uniqueAndSortByPopulatePath(refPaths);
    let pop = await recursivePopulate(refPaths);
    console.log('pop', pop);

    for (const populateOption of pop) {
        query = query.populate(populateOption);
    }

    //endregion



    //region search on model
    let results;
    let query_copy = query.clone();
    const refConditions_res = await buildReferenceConditions(refPaths, searchText);
    if (searchConditions) {
        console.log('searchConditions',searchConditions)
        query_copy.or(searchConditions);
    }
        console.log('refConditions_res',refConditions_res)
    query_copy.or(refConditions_res);
    results = await query_copy.exec();
    if (results.length > 0) {
        return results;
    }
    //endregion


    //region search on referenced models
    results = await query.exec();
    // Apply additional filtering based on populated fields
    return results.filter((result: any) => {
        return refPaths.some(ref => {
            const populatePathParts = ref.populatePath.split('.');
            let value = result;
            for (const part of populatePathParts) {
                value = value && value[part];
            }
            return value && value.toString().match(new RegExp(searchText, 'i'));
        });
    });
    //endregion
}
