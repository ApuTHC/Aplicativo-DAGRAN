import { itemsVisorCategoryType } from "../types/visor";

export const categories: string[] = ["Avenidas Torrenciales", "Movimientos en Masa"];

export const itemsVisorCategory: itemsVisorCategoryType[] = [
    {
        title: "Susceptibilidad",
        description: "Susceptible indica la probabilidad que algo suceda, está vinculado a aquello capaz de ser modificado o de recibir impresión por algo.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad/MapServer",
    },
    {
        title: "Vulnerabilidad",
        description: "Vulnerabilidad es la susceptibilidad o fragilidad física, económica, social, ambiental o institucional que tiene una comunidad de ser afectada o de sufrir efectos adversos en caso de que un evento físico peligroso se presente.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Vunerabilidad/MapServer",
    },
    {
        title: "Amenaza",
        description: "Amenaza es el peligro inminente, que surge, de un hecho o acontecimiento que aún no ha sucedido, pero que de concretarse aquello que se dijo que iba a ocurrir, dicha circunstancia o hecho perjudicará a una o varias personas en particular.",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Amenaza/MapServer",
    },
    {
        title: "Riesgo",
        description: "El riesgo es la posibilidad de que una amenaza cause daños estructurales, naturales y socioeconómicos. ",
        url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesgo/MapServer",
    },
]