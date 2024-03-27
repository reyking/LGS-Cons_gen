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
\\usepackage[margin=2cm]{geometry}
\\usepackage{hhline} % For highlighting table borders
\\usepackage{hyperref}
\\usepackage{array}
\\usepackage{xcolor}
\\usepackage{longtable,makecell,multirow}
\\begin{document}
\\section*{Resumen de actividades realizadas febrero/2024}

En el siguiente reporte se presentan las actividades realizadas por Hans Chritopher Raddatz Garcia durante el mes de febrero del 2024, donde se numeran las actividades principales dentro de la tabla de "Historias" con su total de horas, según las tarifas previamente acordadas, estas tareas principales se subdividen en cada trabajo realizado y estos son descritos en la tabla de "Tareas y detalles" indicando una descripción breve de lo realizado, las personas que estuvieron presente si es que las hubo y el tiempo en horas según cada tarifa.
Finalmente, se presenta las simbologías de tarifas y personas, además cada texto en azul implica que es un vínculo a su respectiva definición dentro de otra tabla, el cual además es clickeable. 
`
const fin = `\\end{document}`
const finTabla = `\n    \\end{tabular}\n\\end{table} \n `
const finLongTable = `\n    \\end{longtable} \n `



function createLinkLtx(donde: string | number | null, nombre?: string): string {
    if (donde === undefined || donde === null) return '\nNo label\n'
    return ` \\label{${donde}}${nombre ? nombre : donde} `
}
function linkToLtx(donde: string | number | null, nombre?: string): string {
    if (donde === undefined || donde === null) return '\nNo label\n'
    return ` \\hyperref[${donde}]{\\color{blue}${nombre ? nombre : donde}} `
}

function roudUp(val: number) {
    let ret = Math.ceil(val * 100);
    return ret / 100;
}
function sanitizar(str: string) {
    return str.split('_').join('\\_')
}
export function abreviacion(str: string) {
    return str.toUpperCase().split(' ').filter(s=>s.length>2).flatMap(c => c[0]).join('')
}


export function genLtexString(compañias: ({ Tarifas: ({ Valores: GetResult<{ Id: number; Nombre: string; Conversion: number; }, never> & {}; } & GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {})[]; Historias: ({ Trabajos: ({ Tarifas: GetResult<{ Id: number; Empresa_id: number; Nombre: string; Valor: number; Valor_id: number; }, never> & {}; Personas_trabajo: ({ Personas: GetResult<{ Id: number; Nombre: string; Nombre_corto: string | null; Empresa_id: number; Correo: string | null; }, never> & {}; } & GetResult<{ Id: number; Persona_id: number; Trabajo_id: number; }, never> & {})[]; } & GetResult<{ Id: number; Descripcion: string | null; Empresa_id: number; Fecha_inicio: Date; Fecha_fin: Date | null; Tarifa_id: number; Historia_id: number | null; }, never> & {})[]; } & GetResult<{ Id: number; Empresa_id: number; Nombre: string; Descripcion: string; }, never> & {})[]; } & GetResult<{ Id: number; Nombre: string; }, never> & {})[]): { name: string, data: string, horas: { tarifa: string, tiempoH: number, total: number }[] }[] {


    let archivos: { name: string, data: string, horas: { tarifa: string, tiempoH: number, total: number }[] }[] = [];
    for (const num in compañias) {
        const comp = compañias[num];
        let horas: { tarifa: string, tiempoH: number, total: number }[] = comp.Tarifas.map(t => ({ tarifa: t.Nombre, tiempoH: 0, total: 0 }));
        let personas: Personas[] = []

        let latex = {
            tablaHistorias: `
\\section{Historias desarrolladas}
En la siguiente tabla se presentan las historias o desarrollos principales con su nombre y descripción y su tiempo total por cada tipo de tarifa.

\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|c|p{3cm}|p{5.8cm}|m{4.5cm}|}
        \\hline
        \\textbf{N°} & \\centering{\\textbf{Nombre Historia}} & \\centering{\\textbf{Detalle}} & \\textbf{Tiempo Total [hrs]}
        \\\\ \\hline`,
            tablaTrabajos: `
\\section{Tareas y detalles}
A continuación se presentan las tareas realizadas con su respectiva explicación, número de historia, un acrónimo de o las personas involucradas en la realización de la tarea si aplica y finalmente un detalle de horas totales trabajadas separado por cada tipo de tarifa.

\\begin{longtable}{|m{0.5cm}|m{1.2cm}|p{5cm}|m{1.5cm}|m{1.5cm}||c|c|c|c|c|c|    |}
        \\hline
        \\multirow{2}{=}{\\centering{\\textbf{N°}}} & \\multirow{2}{=}{\\centering{\\textbf{N°Hist}}} & \\multirow{2}{=}{\\centering{\\textbf{Detalle Tarea}}}  & \\multirow{2}{=}{\\textbf{Personas}} & \\multirow{2}{=}{\\textbf{Fecha}} &   
        \\multicolumn{6}{c|}{
            \\textbf{Horas trabajadas [hrs]}
        } \\\\ 
        \\hhline{~~~~~----}
        &&&&`,
            tablaPersonas: `
\\section{Personas}
Listado de personas y su abreviación para tareas en las que estuvieron involucrados.
\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|p{6cm}|c|}
        \\hline
        \\centering{\\textbf{Nombre}} & \\textbf{abreviacion} \\\\ \\hline`,
            tablaTarifas: `
\\section{Tarifas}
    En la siguiente tabla se presentan las abreviaciones de cada tarifa.
\\begin{table}[htbp]
    \\centering
    \\begin{tabular}{|p{6cm}|c|}
        \\hline
        \\centering{\\textbf{Nombre}} & \\textbf{abreviacion} \\\\ \\hline `
        }

        let tarifas = `\\begin{tabular}{c}\n`
        comp.Tarifas.forEach((t, ind) => {
            tarifas += ind ? `\\hline ${t.Nombre} \\\\ \n` : `${t.Nombre} \\\\ \n`;
            latex.tablaTarifas += ` ${t.Nombre} & ${createLinkLtx(abreviacion(t.Nombre))} \\\\ \\hline \n`;
            latex.tablaTrabajos += `& ${linkToLtx(abreviacion(t.Nombre))} \n`
        })
        tarifas += `\\end{tabular}`;
        latex.tablaTrabajos += `\\\\ \\hline \\hline`

        let tnum = 0;
        comp.Historias.forEach((hist, hnum) => {
            if (hist.Trabajos.length === 0) return;
            // for (const hnum in comp.Historias) {
            //     const hist = comp.Historias[hnum];
            latex.tablaHistorias += `\n ${createLinkLtx(hnum)} & ${sanitizar(hist.Nombre)} & ${sanitizar(hist.Descripcion)} &
            \\begin{tabular}{m{4cm}}\n`;
            let tiempos = new Map<string, number>();
            hist.Trabajos.forEach((trab) => {
                // for (const tnum in hist.Trabajos) {
                // console.log(tnum)
                //     const trab = hist.Trabajos[tnum];
                latex.tablaTrabajos += `
                ${createLinkLtx(tnum)} & ${linkToLtx(hnum)} & ${sanitizar(trab.Descripcion as string)} &  
                `
                let n = 0;
                for (const pnum in trab.Personas_trabajo) {
                    const pers = trab.Personas_trabajo[pnum].Personas;
                    if (pers) personas.push(pers)
                    if (n > 0) latex.tablaTrabajos += '\\newline'
                    latex.tablaTrabajos += ` ${linkToLtx(pers.Nombre_corto)}`
                    n++;
                }
                const horaInicio = moment(trab.Fecha_inicio);
                const duracion = roudUp(moment(trab.Fecha_fin).diff(horaInicio, "hours", true));
                const texto = trab.Tarifas.Id < 50 ? duracion + ' hrs' : `${horaInicio.format("DD/MM/YY HH:MM")} = ${duracion} hrs`;
                latex.tablaTrabajos += ` & ${horaInicio.format("DD/MM/YY hh:mm")} `
                comp.Tarifas.forEach((t, ind) => {
                    latex.tablaTrabajos += ' & '
                    if (t.Id == trab.Tarifa_id) {
                        latex.tablaTrabajos += +duracion
                        let h = horas.find(h => h.tarifa === t.Nombre)
                        if (h) h.tiempoH += duracion
                    }
                })
                latex.tablaTrabajos += `\\\\ \\hline \n`


                const tiempoTrabajo = tiempos.get(trab.Tarifas.Nombre)
                tiempos.set(trab.Tarifas.Nombre, tiempoTrabajo ? tiempoTrabajo + duracion : duracion);

                tnum++;
            });
            let nhh = 0;
            for (let [keyt, value] of tiempos) {
                if (nhh) latex.tablaHistorias += '\\hline \\hline\n'
                latex.tablaHistorias += `${keyt} = ${roudUp(value)} \\\\ \n`;
                nhh++;
            }
            latex.tablaHistorias += `
            \\end{tabular} 
            \\\\ \\hline`

            // }
        })
        //solo personas unicas
        personas = personas.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.Id === value.Id
            ))
        )
        for (const num in personas) {
            const pers = personas[num];
            latex.tablaPersonas += `
        ${pers.Nombre} & ${createLinkLtx(pers.Nombre_corto)} \\\\ \\hline`
        }
        comp.Tarifas.forEach(t => {
            let h = horas.find(h => h.tarifa === t.Nombre)
            if (h) h.total = h.tiempoH * t.Valor * t.Valores.Conversion
        })
        archivos.push({ name: comp.Nombre, data: inicio + latex.tablaHistorias + finTabla + latex.tablaTrabajos + finLongTable + '\\newpage' + latex.tablaPersonas + finTabla + latex.tablaTarifas + finTabla + fin, horas })
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


    return readFileSync(join(outDir, name + '.pdf'));

}