import { itemsVisorCategoryType, subregionsGraphsType } from "../types/visor";

export const categories: string[] = [
  "Avenidas Torrenciales",
  "Movimientos en Masa",
];

export const itemsVisorCategory: itemsVisorCategoryType[] = [
  {
    title: "Susceptibilidad",
    description:
      "Susceptible indica la probabilidad que algo suceda, está vinculado a aquello capaz de ser modificado o de recibir impresión por algo.",
    category: "at",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad/FeatureServer/0",
    legend: [
      {
        value: "Aluvial",
        color: "#e3ffab",
      },
      {
        value: "Inundación de Escombros",
        color: "#ffffab",
      },
      {
        value: "Flujo de escombros canalizados",
        color: "#ffb3b3",
      },
    ],
  },
  {
    title: "Vulnerabilidad",
    description:
      "Vulnerabilidad es la susceptibilidad o fragilidad física, económica, social, ambiental o institucional que tiene una comunidad de ser afectada o de sufrir efectos adversos en caso de que un evento físico peligroso se presente.",
    category: "at",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Vunerabilidad/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Vunerabilidad_at/FeatureServer/0",
    legend: [
      {
        value: "Muy Alto",
        color: "#fe9e8d",
      },
      {
        value: "Alto",
        color: "#ffd58c",
      },
      {
        value: "Medio",
        color: "#f8fe95",
      },
      {
        value: "Bajo",
        color: "#bedb8b",
      },
      {
        value: "Muy Bajo",
        color: "#8ab98c",
      },
      {
        value: "No censado",
        color: "#e5e5e5",
      },
    ],
  },
  {
    title: "Amenaza",
    description:
      "Amenaza es el peligro inminente, que surge, de un hecho o acontecimiento que aún no ha sucedido, pero que de concretarse aquello que se dijo que iba a ocurrir, dicha circunstancia o hecho perjudicará a una o varias personas en particular.",
    category: "at",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Amenaza/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Amenaza_at/FeatureServer/0",
    legend: [
      {
        value: "Muy Alto",
        color: "#f66",
      },
      {
        value: "Alto",
        color: "#fc6",
      },
      {
        value: "Moderado",
        color: "#ff6",
      },
      {
        value: "No Aplica",
        color: "#e0e0e0",
      },
    ],
  },
  {
    title: "Riesgo",
    description:
      "El riesgo es la posibilidad de que una amenaza cause daños estructurales, naturales y socioeconómicos. ",
    category: "at",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesgo/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesg_at/FeatureServer/0",
    legend: [
      {
        value: "Muy Alto",
        color: "#f66",
      },
      {
        value: "Alto",
        color: "#fc6",
      },
      {
        value: "Moderado",
        color: "#ff6",
      },
      {
        value: "No Aplica",
        color: "#e0e0e0",
      },
    ],
  },

  {
    title: "Susceptibilidad",
    description:
      "Susceptible indica la probabilidad que algo suceda, está vinculado a aquello capaz de ser modificado o de recibir impresión por algo.",
    category: "menm",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad_menm_nueva_1/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad_menm_nueva/FeatureServer/0",
    legend: [
      {
        value: "Muy Bajo",
        color: "#b0e000",
      },
      {
        value: "Bajo",
        color: "#ffff00",
      },
      {
        value: "Medio",
        color: "#ffaa00",
      },
      {
        value: "Alto",
        color: "#ff0000",
      },
      {
        value: "Muy Alto",
        color: "#a900e6",
      },
    ],
  },
  {
    title: "Fragilidad Socioeconómica",
    description: "",
    category: "menm",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Fragilidad_socioecon%C3%B3mica/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Fragilidad_socioeconómica/FeatureServer/0",
    legend: [
      {
        value: "Muy alto",
        color: "#a80000",
      },
      {
        value: "Alto",
        color: "#ff0000",
      },
      {
        value: "Medio - alto",
        color: "#ffaa00",
      },
      {
        value: "Medio",
        color: "#ffff00",
      },
      {
        value: "Bajo",
        color: "#87c734",
      },
    ],
  },
  {
    title: "Costo Daño",
    description: "",
    category: "menm",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Costo_da%C3%B1o/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Costo_daño_SHP_1/FeatureServer/0",
    legend: [
      {
        value: "Medio - alto",
        color: "#eb5b2f",
      },
      {
        value: "Medio - bajo",
        color: "#ffff00",
      },
      {
        value: "Bajo",
        color: "#87c734",
      },
      {
        value: "Muy bajo",
        color: "#1a992e",
      },
    ],
  },
  {
    title: "Capacidad Institucional",
    description: "",
    category: "menm",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Capacidad_institucional/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Capacidad_institucional/FeatureServer/0",
    legend: [
      {
        value: "Baja",
        color: "#a80000",
      },
      {
        value: "Medio",
        color: "#ff0000",
      },
      {
        value: "Medio - alto",
        color: "#ffaa00",
      },
    ],
  },
  {
    title: "Riesgo",
    description:
      "El riesgo es la posibilidad de que una amenaza cause daños estructurales, naturales y socioeconómicos. ",
    category: "menm",
    url: "https://tiles.arcgis.com/tiles/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesgo_menm_nueva_2/MapServer",
    urlFeat:
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Riesgo_menm_nueva/FeatureServer/0",
    legend: [
      {
        value: "Muy Alto",
        color: "#a80000",
      },
      {
        value: "Alto",
        color: "#ff0000",
      },
      {
        value: "Medio",
        color: "#ffff00",
      },
      {
        value: "Bajo",
        color: "#87c734",
      },
      {
        value: "Muy Bajo",
        color: "#1a992e",
      },
    ],
  },
];

export const subregionsGraphs: subregionsGraphsType[] = [
  { id: 0, name: "Norte", url: "graphs/Norte_90d.png" },
  { id: 1, name: "Nordeste", url: "graphs/Nordeste_90d.png" },
  { id: 2, name: "Occidente", url: "graphs/Occidente_90d.png" },
  { id: 3, name: "Oriente", url: "graphs/Oriente_90d.png" },
  { id: 4, name: "Sureste", url: "graphs/Sureste_90d.png" },
  { id: 5, name: "Bajo cauca", url: "graphs/Bajo cauca_90d.png" },
];

