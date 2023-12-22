
import { PrismaClient } from '@prisma/client';
import { abreviacion, executeLatex, genLtexString } from './src/latex';
const prisma = new PrismaClient()

const test = false

const inicio = new Date("11-01-2023")
const fin = new Date("12-01-2023")
console.log(inicio)
console.log(fin)

async function main() {
  if (!test) {
    // let contrtatantes = await prisma.empresas.findMany({select:{
    //   Tarifas:true,
    //   Historias:{
    //     select:{
    //       Trabajos:{
    //         where:{
    //           Fecha_inicio:{gte:inicio,lt:fin}
    //         },
    //         include:{
    //           Personas_trabajo:{
    //             include:{
    //               Personas:true
    //             }
    //           },
    //           Tarifas:true
    //         }
    //       }
    //     }
    //   }
    // }});
    let contrtatantes = await prisma.empresas.findMany({ include: { Tarifas: {include:{Valores:true}}, Historias: { include: { Trabajos: { where: { Fecha_inicio: { gte: inicio, lt: fin } }, include: { Tarifas: true, Personas_trabajo: { include: { Personas: true } } } } } } } });
    let archivos = genLtexString(contrtatantes);
    archivos.forEach(ar => {
      executeLatex(ar.data, ar.name);
      console.log(ar.horas)
      let total: number=0;
      ar.horas.forEach(h=>total+=h.total)
      console.log(total)

    })
  } else {
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