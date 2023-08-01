
import { PrismaClient } from '@prisma/client';
import { executeLatex, genLtexString } from './src/latex';
const prisma = new PrismaClient()



async function main() {
  let str = '\\documentclass{article} \\begin{document} hola \\end{document}'
  // let pdf = executeLatex(str, 'nuevo');
  let contrtatantes = await prisma.empresas.findMany({include:{Tarifas:true,Historias:{include:{Trabajos:{include:{Tarifas:true,Personas_trabajo:{include:{Personas:true}}}}}}}});
  let archivos = genLtexString(contrtatantes);
  archivos.forEach(ar=>executeLatex(ar.data,ar.name))

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