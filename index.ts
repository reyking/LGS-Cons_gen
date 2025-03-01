
import { PrismaClient } from '@prisma/client';
import { abreviacion, executeLatex, genLtexString } from './src/latex';
import moment from 'moment';
const prisma = new PrismaClient()

const test = false
moment.locale('es')
const mesAno = moment('1-feb-2025','DD-MMM-YYYY')

// const inicio = new Date("12-01-2024")
// const fin = new Date("1-01-2025")
const inicio = mesAno.toDate();
const fin = mesAno.add(1,'month').toDate()
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
    let archivos = genLtexString(contrtatantes,moment(fin).locale('es').format("MMMM"),moment(fin).locale('es').format("YYYY"));
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