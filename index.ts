
import { PrismaClient } from '@prisma/client';
import { abreviacion, executeLatex, genLtexString } from './src/latex';
const prisma = new PrismaClient()

const test = false


async function main() {
  if(!test){
  let contrtatantes = await prisma.empresas.findMany({include:{Tarifas:true,Historias:{include:{Trabajos:{include:{Tarifas:true,Personas_trabajo:{include:{Personas:true}}}}}}}});
  let archivos = genLtexString(contrtatantes);
  archivos.forEach(ar=>executeLatex(ar.data,ar.name))
}else{
  console.log(abreviacion("hola est so"))

}


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