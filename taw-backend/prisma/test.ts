import prisma from './prisma_db_connection';

/*export default async function selectAllFromDB() {
  try {
    // Esegui la query per selezionare tutti i record dal database
    const allRecords = await prisma.user.findMany();
    
    // Stampa i record ottenuti
    console.log('Tutti i record nel database:', allRecords);
  } catch (error) {
    console.error('Si è verificato un errore durante la selezione di tutti i record:', error);
  } finally {
    // Chiudi la connessione al database
    await prisma.$disconnect();
  }
}*/


export const SelectAllFromDB =async () => {    
    try {
        // Esegui la query per selezionare tutti i record dal database
        const allRecords = await prisma.user.findMany();
        
        // Stampa i record ottenuti
        console.log('Tutti i record nel database:', allRecords);
    } catch (error) {
        console.error('Si è verificato un errore durante la selezione di tutti i record:', error);
    } finally {
        // Chiudi la connessione al database
        await prisma.$disconnect();
    }
}



