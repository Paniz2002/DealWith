
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



/*const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // query di prova
  // per runnare: node prisma/prisma_db_connection.js
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@net.com',
    },
  })

  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  
  })
*/