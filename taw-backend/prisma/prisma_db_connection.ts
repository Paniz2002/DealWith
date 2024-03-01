import { PrismaClient } from "@prisma/client";

class DBConnection {
  private static _instance: PrismaClient;
  private constructor() {
    if (DBConnection._instance)
      throw new Error("Use DBConnection.instance() instead of new.");
    DBConnection._instance = this;
  }
  static get instance() {
    if (!DBConnection._instance) DBConnection._instance = new PrismaClient();
    return DBConnection._instance;
  }
}

// Immutable DB Connection
export default Object.seal(DBConnection.instance());
