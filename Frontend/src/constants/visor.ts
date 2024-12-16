import { itemsVisorCategoryType } from "../types/visor";

export const categories: string[] = ["Avenidas Torrenciales", "Movimientos en Masa"];

export const itemsVisorCategory: itemsVisorCategoryType[] = [
    {
        title: "Susceptibilidad",
        description: "Susceptible indica la probabilidad que algo suceda, está vinculado a aquello capaz de ser modificado o de recibir impresión por algo.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad/MapServer",
        legend: [
            {
                value: "Aluvial",
                color:"#e3ffab"
            },
            {
                value: "Inundación de Escombros",
                color:"#ffffab"
            },
            {
                value: "Flujo de escombros canalizados",
                color:"#ffb3b3"
            },
        ]
    },
    {
        title: "Vulnerabilidad",
        description: "Vulnerabilidad es la susceptibilidad o fragilidad física, económica, social, ambiental o institucional que tiene una comunidad de ser afectada o de sufrir efectos adversos en caso de que un evento físico peligroso se presente.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Vunerabilidad/MapServer",
        legend: [
            {
                value: "Muy Alto",
                color:"#fe9e8d"
            },
            {
                value: "Alto",
                color:"#ffd58c"
            },
            {
                value: "Medio",
                color:"#f8fe95"
            },
            {
                value: "Bajo",
                color:"#bedb8b"
            },
            {
                value: "Muy Bajo",
                color:"#8ab98c"
            },
            {
                value: "No censado",
                color:"#e5e5e5"
            },
        ]
    },
    {
        title: "Amenaza",
        description: "Amenaza es el peligro inminente, que surge, de un hecho o acontecimiento que aún no ha sucedido, pero que de concretarse aquello que se dijo que iba a ocurrir, dicha circunstancia o hecho perjudicará a una o varias personas en particular.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Amenaza/MapServer",
        legend: [
            {
                value: "Muy Alto",
                color:"#f66"
            },
            {
                value: "Alto",
                color:"#fc6"
            },
            {
                value: "Moderado",
                color:"#ff6"
            },
            {
                value: "No Aplica",
                color:"#e0e0e0"
            },
        ]
    },
    {
        title: "Riesgo",
        description: "El riesgo es la posibilidad de que una amenaza cause daños estructurales, naturales y socioeconómicos. ",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesgo/MapServer",
        legend: [
            {
                value: "Muy Alto",
                color:"#f66"
            },
            {
                value: "Alto",
                color:"#fc6"
            },
            {
                value: "Moderado",
                color:"#ff6"
            },
            {
                value: "No Aplica",
                color:"#e0e0e0"
            },
        ]
    },
]