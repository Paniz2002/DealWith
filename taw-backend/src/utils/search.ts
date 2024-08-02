import { Schema, Model } from "mongoose";
// Function to get all string paths from a schema
function getStringPaths(schema: Schema<any>) {
  return Object.keys(schema.paths).filter(
    (path) => schema.paths[path].instance === "String",
  );
}

// Function to search across all string fields of a model
export default function fullTextSearch(
  model: Model<any>,
  searchText: string,
  filter: string = "",
) {
  // Get all string paths from the model's schema
  const stringPaths = getStringPaths(model.schema);

  // Build the search conditions
  const searchConditions = stringPaths.map((path) => ({
    [path]: { $regex: searchText, $options: "i" },
  }));

  // Perform the search with $or
  if (filter) return model.find({ $or: searchConditions }, filter);

  return model.find({ $or: searchConditions });
}
