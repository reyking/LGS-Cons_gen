import { Personas } from "@prisma/client";
import { GetResult } from "@prisma/client/runtime/library";
import { spawnSync } from "child_process";
import { readdir, readFileSync, unlinkSync, writeFileSync, } from 'fs';
import moment from "moment";
import { join } from 'path';
const latexdir = join('./', 'latex')
const outDir = join(latexdir, `build`)
const args = `-output-directory=${outDir}`
const command = `pdflatex`
const inicio = `\\documentclass{article}
\\usepackage{hhline} % For highlighting table borders
\\usepackage{hyperref}
\\usepackage{array}
\\usepackage{longtable}
\\begin{document}`
const fin = `\\end{document}`
const finTabla = `\n    \\end{tabular}\n\\end{table} \n \\newpage`
const finLongTable = `\n    \\end{longtable} \n \\newpage`

function roudUp(val:number){
    let ret = Math.ceil(val*100);
    return ret/100;
}
function sanitizar(str:string){
    return str.split('_').join('\\_')
}


export function genLtexString(compañias: ({
    Tarifas: (GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {})[]; Historias: ({
        Trabajos: ({ Tarifas: GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {}; Personas_trabajo: ({ Personas: GetResult<{ Id: number; Nombre: string; Nombre_corto: string | null; Empresa_id: number; Correo: string | null; }, never> & {}; } & GetResult<{ Id: number; Persona_id: number; Trabajo_id: number; }, never> & {})[]; } & GetResult<{
            Id: number; Descripcion: string | null; //solo personas unicas
            //solo personas unicas
            Empresa_id: number; Fecha_inicio: Date; Fecha_fin: Date | null; Tarifa_id: number; Historia_id: number | null;
        }, never> & {})[];
    } & GetResult<{ Id: number; Empresa_id: number; Nombre: string; Descripcion: string; }, never> & {})[];
} & GetResult<{ Id: number; Nombre: string; }, never> & {})[]): { name: string, data: string }[] {
    
    
    let archivos: { name: string, data: string }[] = [];
    for (const num in compañias) {
        const comp = compañias[num];
        let personas: Personas[] = []
        let tarifas = `\\begin{tabular}{c}\n`
        comp.Tarifas.forEach((t, ind)=>{
            tarifas+= ind?`\\hline ${t.Nombre} \\\\ \n`:`${t.Nombre} \\\\ \n`;
        })
        tarifas+=`\\end{tabular}`;

        let latex = {
            tablaHistorias: `
\\section{Historias desarrolladas}
En la siguiente tablas se presentan las historias realizadas y su tiempo total por cada tipo de tarifa

\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|c|p{3cm}|p{3.5cm}|m{4cm}|}
        \\hline
        \\textbf{n°} & \\textbf{Nombre Historia} & \\textbf{Detalle} & \\textbf{Tiempo Total [hrs]}
        \\\\ \\hline`,
            tablaTrabajos: `
\\section{Tareas y detalles}
A continuacion se prensental las tareas relizadas con su respectiva explicacion, numero de historia padre, personas inlucradas en la realizacion de la tarea si aplica y finalmente un detalle cronologico por cad tipo de tarifa.
\\begin{longtable}{|c|c|p{3cm}|c|c|}
        \\hline
        \\textbf{n°} & \\textbf{n°Hist} & \\textbf{Detalle Tarea}  & \\textbf{Personas} & \\textbf{Horas trabajadas[hrs]} \\\\ \\hline`,
            tablaPersonas: `
\\section{Personas}
Listado de personas y su abreviacion para tareas en las que estubieron involucrados.
\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|c|c|}
        \\hline`,
        }

        for (const hnum in comp.Historias) {
            const hist = comp.Historias[hnum];
            latex.tablaHistorias += `\n\\label{H${hnum}}${hnum} & ${sanitizar(hist.Nombre)} & ${sanitizar(hist.Descripcion)} &
            \\begin{tabular}{m{3.5cm}}\n`;
            let tiempos = new Map<string, number>();

            for (const tnum in hist.Trabajos) {
                const trab = hist.Trabajos[tnum];
                latex.tablaTrabajos += `
                \\label{T${tnum}}${tnum} & \\hyperref[H${hnum}]{h${hnum}} & ${sanitizar(trab.Descripcion as string)} &  
                `
                for (const pnum in trab.Personas_trabajo) {
                    const pers = trab.Personas_trabajo[pnum].Personas;
                    if (pers) personas.push(pers)
                    latex.tablaTrabajos += ` \\hyperref[${pers.Nombre_corto}]{${pers.Nombre_corto}}`
                }
                const horaInicio = moment(trab.Fecha_inicio);
                const duracion = roudUp(moment(trab.Fecha_fin).diff(horaInicio, "hours", true));
                const texto = trab.Tarifas.Id < 50 ? duracion + ' hrs' : `${horaInicio.format("DD/MM/YY HH:MM")} = ${duracion} hrs`;
                latex.tablaTrabajos += ` &
                \\begin{tabular}{m{3cm}}
                    ${trab.Tarifas.Nombre} \\\\
                    `+ texto + `
                \\end{tabular}
                \\\\ \\hline`


                const tiempoTrabajo = tiempos.get(trab.Tarifas.Nombre)
                tiempos.set(trab.Tarifas.Nombre,tiempoTrabajo?tiempoTrabajo+duracion:duracion);


            }
            for (let [keyt, value] of tiempos) {
                latex.tablaHistorias += `${keyt} = ${roudUp(value)} \\\\ \\hline \n`;
            }
            latex.tablaHistorias += `
            \\end{tabular} 
            \\\\ \\hline`

        }
        //solo personas unicas
        personas = personas.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.Id === value.Id
            ))
        )
        for (const num in personas) {
            const pers = personas[num];
            latex.tablaPersonas += `
        ${pers.Nombre} & \\label{${pers.Nombre_corto}}${pers.Nombre_corto} \\\\ \\hline`
        }
        archivos.push({ name: comp.Nombre, data: inicio + latex.tablaHistorias + finTabla + latex.tablaTrabajos + finLongTable + latex.tablaPersonas + finTabla + fin })
    }
    return archivos
}

export function executeLatex(latexString: string, name: string) {
    //crear archivo
    const infile = join(latexdir, name + '.tex');
    writeFileSync(infile, latexString, { flag: "w+" });

    
    let latex1 = spawnSync(command, [args, infile]);
    if (latex1.status != 0) throw new Error("no se pudo ejecutar  por primera vez latex");
    let latex2 = spawnSync(command, [args, infile]);
    if (latex2.status != 0) throw new Error("no se pudo ejecutar  por primera vez latex");
    //remover aux
    let dir = readdir(outDir, (err, files) => {
        if (err) {
            console.log("no se encontraron archivos auxiliares omitir boracion");
            return;
        }
        files.forEach(file => {
            const fileDir = join(outDir, file);
            if (file !== name + '.pdf') {
                unlinkSync(fileDir);
            }
        })
    });
    //retornar archivo
    

    return readFileSync(join(outDir,  name + '.pdf'));

}