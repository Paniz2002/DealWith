import {Model, models, PopulateOptions, Query, Schema} from "mongoose";
import {capitalizeFirstLetter} from "../index";


function getStringAndReferencePaths(schema: Schema<any>, prefix = ""): {
    stringPaths: string[],
    refPaths: { path: string, model: string, populatePath: string }[]
} {
    let stringPaths: string[] = [];
    let refPaths: { path: string, model: string, populatePath: string }[] = [];

    for (const path in schema.paths) {
        const fullPath = prefix ? `${prefix}.${path}` : path;
        const schemaType = schema.paths[path];

        if (schemaType.instance === "String") {
            stringPaths.push(fullPath);
            if (prefix) { //keep penultimate prefix
                let temp_prefix = fullPath.split('.').at(-2);

                //remove last part of the path
                let populate_path = fullPath.split('.').slice(0, -1).join('.');
                if (!temp_prefix) {
                    temp_prefix = '';
                }
                refPaths.push({path: path, model: temp_prefix, populatePath: populate_path});
            }

        } else if (schemaType.instance === "ObjectId") {
            if (schemaType.options.ref) {
                const referencedModelName = schemaType.options.ref;
                let subPaths;
                if (typeof referencedModelName === 'string' && models[referencedModelName]) {
                    subPaths = getStringAndReferencePaths(models[referencedModelName].schema, fullPath)
                } else {
                    subPaths = getStringAndReferencePaths(referencedModelName().schema, fullPath)
                    stringPaths.push(...subPaths.stringPaths);
                    refPaths.push(...subPaths.refPaths);

                }
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


    return {stringPaths, refPaths};
}

async function buildReferenceConditions(refPaths: { path: string, model: string }[], searchText: string) {
    const refConditions = [];
    for (let {path, model} of refPaths) {
        model = capitalizeFirstLetter(model);
        if (typeof models[model] !== 'undefined') {
            const referencedModel = models[model];
            const {stringPaths} = getStringAndReferencePaths(referencedModel.schema);
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

function recursivePopulate(refPaths: { path: string, model: string, populatePath: string }[]) {
    let populatePaths = {};
    for (const ref of refPaths) {
        if (!ref.populatePath.includes('.')) {
            let temp_populate = {
                model: models[capitalizeFirstLetter(ref.model)],
                path: ref.model,
                populate: {}
            };
            let new_refs = [];
            for (const subPath of refPaths) {
                if (subPath != ref && subPath.populatePath.includes(ref.model)) {
                    subPath.populatePath = subPath.populatePath.replace(ref.model + '.', '');
                    new_refs.push(subPath);
                }
            }

            let new_popo = recursivePopulate(new_refs);
            if (Object.keys(new_popo).length > 0) {
                for (const [temp_key, temp_value] of Object.entries(new_popo)) {
                    for (const [key, value] of Object.entries(temp_value as Object)) {
                        (temp_populate['populate'] as any)[key] = value;
                    }
                }
            }

            //delete if populate is empty
            if (Object.keys(temp_populate['populate']).length === 0) {
                // @ts-ignore
                delete temp_populate['populate'];
            }

            // @ts-ignore
            populatePaths[ref.populatePath] = temp_populate;
        }
    }
    return populatePaths;
}


export default async function fullTextSearch(
    model: Model<any>,
    searchText: string,
    filter: string = "",
) {
    const {stringPaths, refPaths} = getStringAndReferencePaths(model.schema);

    const searchConditions = stringPaths.map((path) => ({
        [path]: {$regex: searchText, $options: "i"},
    }));

    let query: Query<any, any, any, any, any, any> = model.find({});

    if (filter) query.select(filter);


    if (searchText) {
        let temp_refPaths = refPaths.filter((v, i, a) => a.findIndex(t => (t.model === v.model)) === i);
        //sort them by model name
        temp_refPaths.sort((a, b) => a.populatePath.localeCompare(b.populatePath));
        let pop = recursivePopulate(temp_refPaths);
        for (const [key, value] of Object.entries(pop)) {
            if (model.schema.paths.hasOwnProperty(key)) {
                query = query.populate(value as PopulateOptions);
            }
        }
    }


    let results;
    let query_copy = query.clone();
    const refConditions_res = await buildReferenceConditions(refPaths, searchText);
    query_copy.or(searchConditions);
    query_copy.or(refConditions_res);
    results = await query_copy.exec();

    if (results.length > 0) {
        return results;
    }

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
}
