import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import * as EsriLeaflet from "esri-leaflet";
import "esri-leaflet-renderers";
import * as EsriVectorLeaflet from "esri-leaflet-vector";
// import * as EsriLegendLeaflet from "esri-leaflet-legend";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  categories,
  itemsVisorCategory,
  subregionsGraphs,
} from "../../constants/visor";
// import * as Locate from "leaflet.locatecontrol/dist/L.Control.Locate.min.js";
import * as Locate from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { municipios } from "../../constants/municipios";
import { subregiones } from "../../constants/subregiones";
import * as d3 from "d3";

export const Visor = () => {
  type ToggleLayerType = () => void;

  // const [currentMuni, setCurrentMuni] = useState<GeoJSON.Feature | undefined>();
  // const [currentLayer, setCurrentLayer] = useState<string>("");

  const drawMaskClipPath = (geojson: GeoJSON.Feature, clipPath: any) => {
    // Limpiar cualquier path previo en el clipPath
    clipPath.selectAll("*").remove();

    const coords = (geojson.geometry as any).coordinates[0][0];
    const latLngs = coords.map((coord: number[]) =>
      map.current?.latLngToLayerPoint([coord[1], coord[0]])
    );
    const d = `M${latLngs
      .map((point: Record<"x" | "y", number>) => `${point.x},${point.y}`)
      .join(" ")} Z`;

    // Agregar el nuevo path al clipPath
    clipPath.append("path").attr("d", d);
  };

  const modPane = (geojson: GeoJSON.Feature, paneName: string) => {
    const pane = map.current?.getPane(paneName);

    const svg = L.svg({ pane: paneName });
    map.current?.addLayer(svg);

    const svgLayer = d3.select(map.current?.getPanes()[paneName]).select("svg");
    const defs = svgLayer.append("defs");
    const clipPath = defs
      .append("clipPath")
      .attr("id", `mask-clip-${geojson.properties?.Code}`);
    drawMaskClipPath(geojson, clipPath);
    if (pane) {
      pane.style.clipPath = `url(#mask-clip-${geojson.properties?.Code})`;
    }
    map.current?.on("zoomend moveend", () =>
      drawMaskClipPath(geojson, clipPath)
    );
  };

  class MapLayer {
    layer: L.TileLayer;
    title: string;
    active: boolean;
    transp: number;
    category: string;
    url: string;
    urlFeat: string;
    ToggleLayer: ToggleLayerType;

    constructor(
      layer: L.TileLayer,
      title: string,
      active: boolean,
      transp: number,
      category: string,
      url: string,
      urlFeat: string,
      ToggleLayer: ToggleLayerType
    ) {
      this.layer = layer;
      this.title = title;
      this.active = active;
      this.transp = transp;
      this.category = category;
      this.url = url;
      this.urlFeat = urlFeat;
      this.ToggleLayer = ToggleLayer;
    }
  }

  const ToggleMapLayer = () => {
    checks.map((check, index) => {
      if (check.check) {
        if (!itemsLayerMap.current[index].active) {
          itemsLayerMap.current[index].layer.addTo(map.current!);
          itemsLayerMap.current[index].active = true;
        }
      } else {
        if (itemsLayerMap.current[index].active) {
          map.current!.removeLayer(itemsLayerMap.current[index].layer);
          itemsLayerMap.current[index].active = false;
        }
      }
    });
  };

  const [currentCategory, setCurrentCategory] = useState<string>(categories[1]);

  const [transps, setTranspas] = useState([
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
    { transp: 100 },
  ]);
  const [checks, setChecks] = useState([
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
  ]);

  const map = useRef<L.Map | null>(null);
  const itemsLayerMap = useRef<MapLayer[]>([]);

  // const [featQuerys, setFeatQuerys] = useState<EsriLeaflet.Query[]>([]);
  const [listInfo, setListInfo] = useState<object[]>([]);
  const [showModalGraph, setShowModalGraph] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);
  // const [subregionGraph, setSubregionGraph] = useState<string>("Norte");
  // const [subregionArray, setSubregionArray] = useState<string[]>([
  //   "Norte",
  //   "Nordeste",
  //   "Occidente",
  //   "Oriente",
  //   "Sureste",
  //   "Bajo cauca",
  // ]);

  const [municipiosName, setMunicipiosName] = useState<string[]>([]);
  const [subregionesName, setSubregionesName] = useState<string[]>([]);
  const [inventario, setInventario] = useState<
    GeoJSON.FeatureCollection | undefined
  >(undefined);
  const [inventarioLayerCluster, setInventarioLayerCluster] = useState<
    L.Layer | undefined
  >(undefined);

  const buildInvLayer = (
    geojson: GeoJSON.FeatureCollection,
    type: string,
    field: string
  ) => {
    const feats: any[] = [];

    geojson.features.map((feat) => {
      if (feat.properties) {
        if (
          type === "all" ||
          (type === "muni" && feat.properties.MPIO_CNMBR === field) ||
          (type === "sub" && feat.properties.REGION === field)
        ) {
          feats.push(feat);
        }
      }
    });

    const markersCluster = new L.MarkerClusterGroup({
      // spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 15,
      // clusterPane: "customPane",
    });
    for (const feature of feats) {
      L.geoJson(feature, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng);
          // .bindPopup(
          //   Object.keys(feature.properties)
          //     .map(function (k) {
          //       return k + ": " + feature.properties[k];
          //     })
          //     .join("<br />"),
          //   {
          //     maxHeight: 200,
          //   }
          // );
        },
        onEachFeature: (feature, layer) => {
          markersCluster.addLayer(layer);
          layer.on("click", () => {
            const listaux: object[] = [];
            listaux.push({
              name: "Inventario MenM",
              data: [
                {
                  name: "Tipo",
                  value: feature.properties.Tipo,
                },
                {
                  name: "Fecha",
                  value: feature.properties.Fecha,
                },
                {
                  name: "Detonante",
                  value: feature.properties.Detonante,
                },
                {
                  name: "Fuente",
                  value: feature.properties.Fuente,
                },
                {
                  name: "Incertidumbre",
                  value: feature.properties.Incertidum,
                },
                // {
                //   name: "Categoria",
                //   value: feature.properties.Categoria,
                // },
              ],
            });

            setListInfo(listaux);
          });
        },
      });
    }

    if (inventarioLayerCluster && checkInv) {
      map.current?.removeLayer(inventarioLayerCluster);
      markersCluster.addTo(map.current!);
    }
    setInventarioLayerCluster(markersCluster);
  };

  useEffect(() => {
    if (!map.current) {
      map.current = L.map("map", { maxZoom: 25 }).setView([7.1, -76.5], 8);
      map.current.createPane("hillshadePane");
      map.current.createPane("imagePane");
      map.current.createPane("customPane");
      map.current.createPane("featPane");
      const hillshadePane = map.current.getPane("hillshadePane");
      const imagePane = map.current.getPane("imagePane");
      const customPane = map.current.getPane("customPane");
      const featPane = map.current.getPane("featPane");
      if (featPane) {
        featPane.style.zIndex = "40"; // Asignación de zIndex como string
      }
      if (customPane) {
        customPane.style.zIndex = "100"; // Asignación de zIndex como string
      }
      if (hillshadePane) {
        hillshadePane.style.zIndex = "0"; // Asignación de zIndex como string
      }
      if (imagePane) {
        imagePane.style.zIndex = "10"; // Asignación de zIndex como string
      }
      map.current.removeControl(map.current.zoomControl);
      const newZoomControl = L.control.zoom({
        position: "bottomright",
      });
      newZoomControl.addTo(map.current);

      const locateControl = Locate.locate({
        position: "bottomright",
        strings: {
          title: "Mostrar mi ubicación",
        },
        flyTo: true,
        locateOptions: {
          enableHighAccuracy: true,
        },
      });

      // Agregar el control al mapa
      locateControl.addTo(map.current);

      EsriVectorLeaflet.vectorBasemapLayer("ArcGIS:Hillshade:Dark", {
        apiKey:
          "AAPK858e9fb220874181a8cee37c6c7c05e0JFjKsdmGsd2C7oV31x1offnFB9ia6ew61D9N_tANtlZny5LFO1hIU6Xj2To6eiUp",
        opacity: 1,
        pane: "hillshadePane",
      }).addTo(map.current);
      L.tileLayer(
        "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
        {
          maxZoom: 19,
          opacity: 0.45,
          pane: "imagePane",
          attribution: "&copy; Google",
        }
      ).addTo(map.current);
      // EsriLeaflet.basemapLayer("ImageryLabels", { pane: "imagePane" }).addTo(
      //   map.current
      // );

      EsriLeaflet.featureLayer({
        url: "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/municipios/FeatureServer/0",
        cacheLayers: true,
        simplifyFactor: 0.9,
        precision: 5,
        renderer: L.canvas(),
        pane: "featPane",
      }).addTo(map.current);

      const municipiosNameAux: string[] = [];
      municipios.features.map((feat) =>
        municipiosNameAux.push(feat.properties.MPIO_CNMBR)
      );
      setMunicipiosName(municipiosNameAux);
      const subregionesNameAux: string[] = [];
      subregiones.features.map((feat) =>
        subregionesNameAux.push(feat.properties.REGION)
      );
      setSubregionesName(subregionesNameAux);

      async function fetchFeatureServerGeoJSON(
        url: string,
        offset = 0,
        recordCount = 2000
      ) {
        const features = [];
        let hasMoreData = true;

        console.log("llamado");

        while (hasMoreData) {
          const queryUrl = `${url}/query?where=1%3D1&outFields=*&f=geojson&resultOffset=${offset}&resultRecordCount=${recordCount}`;
          const response = await fetch(queryUrl);
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            console.log("data.features.length", data.features.length);
            features.push(...data.features);
            offset += recordCount;
          } else {
            hasMoreData = false;
          }
        }

        return { type: "FeatureCollection", features };
      }

      // Uso
      const featureServerUrl =
      // "https://www.medellin.gov.co/servidormapas/rest/services/mapas_nacionales/VC_Catastro/MapServer/1";
      // "https://www.medellin.gov.co/servidormapas/rest/services/mapas_nacionales/VC_Infraestructura_Fisica/MapServer/0";
      "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/inventario/FeatureServer/0";
        // "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Inventario_V_20_02_mun/FeatureServer/0";


      fetchFeatureServerGeoJSON(featureServerUrl).then(
        (geojson: GeoJSON.FeatureCollection) => {
          console.log(geojson); // Agrega el GeoJSON al mapa o guárdalo
          setInventario(geojson);

          buildInvLayer(geojson, "all", "");
        }
      );

      const featsQuerysAux: EsriLeaflet.Query[] = [];

      itemsVisorCategory.map((item) => {
        featsQuerysAux.push(
          EsriLeaflet.query({
            url: item.urlFeat,
          })
        );
      });

      const runQuerys = (latlng: L.LatLng) => {
        const listaux: object[] = [];
        const promises: Promise<void>[] = [];

        featsQuerysAux.forEach((featureQuery, index) => {
          if (checks[index].check) {
            const promise = new Promise<void>((resolve, reject) => {
              featureQuery
                .nearby(latlng, 10) // Radio de búsqueda en metros
                .run((error, featureCollection) => {
                  if (error) {
                    console.error(
                      "Error al consultar el Feature Layer:",
                      error
                    );
                    reject(error); // Rechazar la promesa si hay un error
                    return;
                  }

                  console.log(featureCollection);

                  if (featureCollection.features.length > 0) {
                    if (itemsLayerMap.current[index].category === "menm") {
                      switch (itemsLayerMap.current[index].title) {
                        case "Susceptibilidad":
                          listaux.push({
                            name: "Susceptibilidad MenM",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Mapa4_clas,
                              },
                              {
                                name: "Agrupación",
                                value:
                                  featureCollection.features[0].properties
                                    .clusters,
                              },
                              {
                                name: "Movimientos en el Inventario",
                                value:
                                  featureCollection.features[0].properties
                                    .mm_inv,
                              },
                              {
                                name: "Movimientos Esperados (Predichos)",
                                value: Number(parseFloat(featureCollection.features[0].properties.mm_esp).toFixed(3)),
                              },
                              {
                                name: "Residual",
                                value:
                                  Number(parseFloat(featureCollection.features[0].properties.dif).toFixed(3)),
                              },
                              {
                                name: "Municipio",
                                value:
                                  featureCollection.features[0].properties
                                    .nom_mun,
                              },
                            ],
                          });
                          break;

                        case "Fragilidad Socioeconómica":
                          listaux.push({
                            name: "Fragilidad Socioeconómica MenM",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Mapa1_recl,
                              },
                              {
                                name: "Índice de fragilidad de unidad domestica",
                                value:
                                  featureCollection.features[0].properties
                                    .id_frado_c,
                              },
                              {
                                name: "Índice de fragilidad de los medios de vida",
                                value:
                                  featureCollection.features[0].properties
                                    .id_frame_c,
                              },
                              {
                                name: "Índice de fragilidad de las condiciones de productividad",
                                value:
                                  featureCollection.features[0].properties
                                    .id_fropr_c,
                              },
                              {
                                name: "Índice de fragilidad de en términos de asociatividad",
                                value:
                                  featureCollection.features[0].properties
                                    .id_freas_c,
                              },
                              {
                                name: "Municipio",
                                value:
                                  featureCollection.features[0].properties
                                    .nom_mun,
                              },
                            ],
                          });
                          break;

                        case "Costo Daño":
                          listaux.push({
                            name: "Costo Daño MenM",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Mapa2_recl,
                              },
                              {
                                name: "Presupuesto municipal",
                                value:
                                  featureCollection.features[0].properties
                                    .pre_mun_p,
                              },
                              {
                                name: "Costo del daño estructural",
                                value:
                                  featureCollection.features[0].properties
                                    .Cos_v_cla,
                              },
                              {
                                name: "Porcentaje de daño de la unidad de ladera respecto al presupuesto municipal",
                                value:
                                  featureCollection.features[0].properties
                                    .daño_por + "%",
                              },
                              {
                                name: "Personas DANE redistribuidas",
                                value:
                                  featureCollection.features[0].properties
                                    .per_dane_r,
                              },
                              {
                                name: "Viviendas  DANE redistribuidas",
                                value:
                                  featureCollection.features[0].properties
                                    .viv_dane_r,
                              },
                              {
                                name: "Daño de personas",
                                value:
                                  featureCollection.features[0].properties
                                    .daño_pe_r,
                              },
                              {
                                name: "Vulnerabilidad estructural",
                                value:
                                  featureCollection.features[0].properties
                                    .vul_fis_cl,
                              },
                              {
                                name: "Municipio",
                                value:
                                  featureCollection.features[0].properties
                                    .nom_mun,
                              },
                            ],
                          });
                          break;

                        case "Capacidad Institucional":
                          listaux.push({
                            name: "Capacidad Institucional MenM",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Mapa3_recl,
                              },
                              {
                                name: "Índice capacidad Político Institucional",
                                value:
                                  featureCollection.features[0].properties
                                    .cor_eje__1,
                              },
                              {
                                name: "Índice capacidades municipales para el proceso de manejo de desastres",
                                value:
                                  featureCollection.features[0].properties
                                    .Manejo_aj_,
                              },
                              {
                                name: "Municipio",
                                value:
                                  featureCollection.features[0].properties
                                    .nom_mun,
                              },
                            ],
                          });
                          break;

                        case "Riesgo":
                          listaux.push({
                            name: "Riesgo MenM",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .RIESG_clas,
                              },
                              {
                                name: "Agrupación",
                                value:
                                  featureCollection.features[0].properties
                                    .cluster_F,
                              },
                              {
                                name: "Descripción Agrupación",
                                value:
                                  featureCollection.features[0].properties
                                    .c_descrip,
                              },
                              {
                                name: "Municipio",
                                value:
                                  featureCollection.features[0].properties
                                    .nom_mun,
                              },
                            ],
                          });
                          break;

                        default:
                          break;
                      }
                    } else if (itemsLayerMap.current[index].category === "at") {
                      switch (itemsLayerMap.current[index].title) {
                        case "Susceptibilidad":
                          listaux.push({
                            name: "Susceptibilidad AvT",
                            data: [
                              {
                                name: "Tipo de Evento",
                                value:
                                  featureCollection.features[0].properties
                                    .Tipo_event,
                              },
                            ],
                          });
                          break;

                        case "Vulnerabilidad":
                          listaux.push({
                            name: "Vulnerabilidad AvT",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Vun_Clas,
                              },
                            ],
                          });
                          break;

                        case "Amenaza":
                          listaux.push({
                            name: "Amenaza AvT",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Amenaza_50,
                              },
                            ],
                          });
                          break;

                        case "Riesgo":
                          listaux.push({
                            name: "Riesgo AvT",
                            data: [
                              {
                                name: "Clasificación",
                                value:
                                  featureCollection.features[0].properties
                                    .Riesgo,
                              },
                            ],
                          });
                          break;

                        default:
                          break;
                      }
                    }
                  }

                  resolve(); // Resolver la promesa cuando termine el procesamiento
                });
            });

            promises.push(promise);
          }
        });

        // Esperar a que todas las promesas se completen
        Promise.all(promises)
          .then(() => {
            setListInfo(listaux); // Llamar a setListInfo después de que todas las consultas terminen
          })
          .catch((error) => {
            console.error("Ocurrió un error en las consultas:", error);
          });
      };

      map.current.on("click", function (e) {
        // `e` contiene información del evento, como la ubicación del clic
        console.log("Clic en el mapa:", e.latlng);
        // Llama a la función que desees
        runQuerys(e.latlng);
      });
    }
    ToggleMapLayer();
  }, [checks]);

  console.log(inventario);

  useLayoutEffect(() => {
    if (itemsLayerMap.current.length === 0) {
      itemsVisorCategory.map((item) => {
        itemsLayerMap.current.push(
          new MapLayer(
            EsriLeaflet.tiledMapLayer({
              url: item.url,
              pane: "customPane",
              maxZoom: 25,
            }),
            item.title,
            false,
            1,
            item.category,
            item.url,
            item.urlFeat,
            ToggleMapLayer
          )
        );
      });
    }
  }, [itemsVisorCategory]);

  const handleChangeCategory = (category: string) => {
    setCurrentCategory(category);
  };
  const handleOpacityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newTransps = [...transps];
    newTransps[id].transp = parseInt(event.target.value, 10); // Actualiza el valor del estado correctamente
    setTranspas(newTransps);

    itemsLayerMap.current[id].layer.setOpacity(newTransps[id].transp / 100);
  };

  const handleCheckChange = (id: number) => {
    const newChecks = [...checks];
    newChecks[id].check = !newChecks[id].check;
    // if (newChecks[id].check) {
    //   setCurrentLayer(itemsLayerMap.current[id].urlFeat);
    // }
    setChecks(newChecks);
  };

  const [checkInv, setCheckInv] = useState(false);
  const handleInvCheckChange = () => {
    console.log("first");
    setCheckInv((prev) => {
      if (inventarioLayerCluster) {
        if (prev) {
          map.current?.removeLayer(inventarioLayerCluster);
        } else {
          map.current?.addLayer(inventarioLayerCluster);
        }
      }
      return !prev;
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [searchTermSub, setSearchTermSub] = useState("");
  const [isDropdownOpenSub, setIsDropdownOpenSub] = useState(false);

  const filteredMunicipios = municipiosName.filter((municipio) =>
    municipio.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSubregiones = subregionesName.filter((subregion) =>
    subregion.toLowerCase().includes(searchTermSub.toLowerCase())
  );

  const handleSelect = (search: string, opt: string) => {
    let feature: GeoJSON.Feature | undefined;
    if (opt === "muni") {
      setSearchTerm(search);
      setIsDropdownOpen(false);
      feature = municipios.features.find(
        (feat) => feat.properties.MPIO_CNMBR === search
      );
    } else {
      setSearchTermSub(search);
      setIsDropdownOpenSub(false);
      feature = subregiones.features.find(
        (feat) => feat.properties.REGION === search
      );
    }

    if (feature) {
      map.current?.fitBounds(L.geoJSON(feature).getBounds(), {
        paddingTopLeft: [300, 0], // Espacio adicional en la esquina superior izquierda
        paddingBottomRight: [0, 0], // No ajustar el padding inferior derecho
      });
      // setCurrentMuni(feature);
      buildInvLayer(inventario, opt, search);
      const pane = map.current?.getPane("customPane");
      if (pane) {
        pane.style.clipPath = "";
      }
      modPane(feature, "customPane");
    } else {
      const pane = map.current?.getPane("customPane");
      if (pane) {
        pane.style.clipPath = "";
      }
    }
  };
  const handleSelectVoid = () => {
    setSearchTerm("");
    buildInvLayer(inventario, "all", "");
    const pane = map.current?.getPane("customPane");
    if (pane) {
      pane.style.clipPath = "";
    }
  };

  return (
    <div>
      <div className="fixed top-0 flex justify-end h-[150px] w-full z-[9999]">
        <div className="flex justify-center items-center p-[15px] m-[15px] bg-white rounded-[10px]">
          <img
            src="img/geohazards-dagran-gobant.png"
            className="object-cover h-[100px]"
          />
        </div>
      </div>
      <div className="fixed z-[500] w-[160px] right-[15px] top-[150px]">
        <input
          type="text"
          className="w-full px-4 py-2 font-promp border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar municipio..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value === "") {
              handleSelectVoid();
            }
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
        {isDropdownOpen && (
          <ul className="absolute z-[501] w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredMunicipios.length > 0 ? (
              filteredMunicipios.map((municipio) => (
                <li
                  key={municipio}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSelect(municipio, "muni")}
                >
                  {municipio}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">
                No se encontraron resultados
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="fixed z-[500] w-[160px] right-[190px] top-[150px]">
        <input
          type="text"
          className="w-full px-4 py-2 font-promp border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar Subregión..."
          value={searchTermSub}
          onChange={(e) => {
            setSearchTermSub(e.target.value);
            if (e.target.value === "") {
              handleSelectVoid();
            }
          }}
          onFocus={() => setIsDropdownOpenSub(true)}
        />
        {isDropdownOpenSub && (
          <ul className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredSubregiones.length > 0 ? (
              filteredSubregiones.map((subregion) => (
                <li
                  key={subregion}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSelect(subregion, "sub")}
                >
                  {subregion}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">
                No se encontraron resultados
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="fixed z-[500] h-[100vh] w-[450px] flex justify-center items-start">
        <div
          onClick={() => {
            setIsDropdownOpen(false);
            setIsDropdownOpenSub(false);
          }}
          className="h-[95vh] w-[420px] bg-white opacity-90 rounded-[10px] mt-[15px] flex flex-col"
        >
          <div className="w-full h-[15%] flex flex-col items-center justify-center text-center">
            <h1 className="text-[8rem] font-black leading-none">VER</h1>
            <h2 className="text-[2.5rem] font-medium">
              Visor de Escenarios de Riesgo
            </h2>
          </div>
          <div className="w-full h-[85%] flex flex-col justify-between">
            <div className="w-full h-[70%] flex flex-col overflow-y-auto">
              <nav className="m-2 border-b-2">
                <ul className="flex flex-row flex-wrap justify-start">
                  {categories.map((category, index) => (
                    <li
                      key={index}
                      className={`relative ${
                        currentCategory === category
                          ? "text-black font-semibold before:block before:absolute before:-left-5 before:top-2 before:bg-primary1 before:w-[9px] before:h-[17px]"
                          : "text-bgSomeTextMedia"
                      } text-[1.5rem] font-normal rounded-2xl  cursor-pointer pb-4 first:ml-[20px] first:mr-[30px]`}
                      onClick={() => handleChangeCategory(category)}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </nav>
              <div>
                {currentCategory === "Avenidas Torrenciales" &&
                  itemsVisorCategory.length > 0 &&
                  itemsVisorCategory.map((item, index) => {
                    if (item.category !== "at") return null;
                    return (
                      <details key={index} className="w-full group">
                        <summary className="cursor-pointer relative flex justify-center items-center h-[20px] w-full py-[20px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                          <h2 className="text-[1.6rem] font-bold text-center">
                            {item.title}
                          </h2>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform group-open:hidden">
                            +
                          </span>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform hidden group-open:inline">
                            -
                          </span>
                        </summary>
                        <div className="w-full h-full border-b-[2px] pb-[10px]">
                          <p className="text-[1.4rem] font-medium text-justify mt-4 px-10">
                            {item.description}
                          </p>
                          <div className="w-full flex flex-row justify-center items-center my-10">
                            <div
                              className="flex items-center relative mr-10"
                              onClick={() => handleCheckChange(index)}
                            >
                              <input
                                id="slider"
                                type="checkbox"
                                checked={checks[index].check}
                                onChange={() => {}}
                                className="w-[37px] h-8 bg-gray-300 rounded-full appearance-none cursor-pointer peer"
                              />
                              <span
                                className={`w-8 h-8 bg-white rounded-full transition-transform duration-300 ease-in-out absolute cursor-pointer left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1 border peer-checked:border-none`}
                              ></span>
                            </div>
                            <div className="flex flex-row items-center justify-center">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={transps[index].transp}
                                onChange={(e) => handleOpacityChange(e, index)}
                                className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <span className="text-[1.5rem] font-semibold text-gray-700 ml-4">
                                Opacidad:{transps[index].transp}%
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start w-full px-[25px] mb-4">
                            <p className="text-[1.3rem]">Se clasifica en:</p>
                            {item.legend.map((legend, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-center"
                              >
                                <div
                                  className="w-8 h-6 mr-2 border border-black"
                                  style={{ backgroundColor: legend.color }}
                                ></div>
                                <p className="text-[1.3rem]">{legend.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    );
                  })}
              </div>
              <div>
                {currentCategory === "Movimientos en Masa" ? (
                  <>
                    <details key={"inventario"} className="w-full group">
                      <summary className="cursor-pointer relative flex justify-center items-center h-[20px] w-full py-[20px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                        <h2 className="text-[1.6rem] font-bold text-center">
                          {"Inventario de Eventos"}
                        </h2>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform group-open:hidden">
                          +
                        </span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform hidden group-open:inline">
                          -
                        </span>
                      </summary>
                      <div className="w-full h-full border-b-[2px] pb-[10px]">
                        <p className="text-[1.4rem] font-medium text-justify mt-4 px-10">
                          {
                            "Recopilación de eventos morfodinámicos en Antioquia."
                          }
                        </p>
                        <div className="w-full flex flex-row justify-center items-center my-10">
                          <label className="mr-[5px] text-[1.3rem] font-medium">
                            Inventario Antioquia:{" "}
                          </label>
                          <div
                            className="flex items-center relative mr-10"
                            onClick={() => handleInvCheckChange()}
                          >
                            <input
                              id="slider"
                              type="checkbox"
                              checked={checkInv}
                              onChange={() => {}}
                              className="w-[37px] h-8 bg-gray-300 rounded-full appearance-none cursor-pointer peer"
                            />
                            <span
                              className={`w-8 h-8 bg-white rounded-full transition-transform duration-300 ease-in-out absolute cursor-pointer left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1 border peer-checked:border-none`}
                            ></span>
                          </div>
                        </div>
                      </div>
                    </details>

                    {itemsVisorCategory.length > 0 &&
                      itemsVisorCategory.map((item, index) => {
                        if (item.category !== "menm") return null;
                        return (
                          <details key={index} className="w-full group">
                            <summary className="cursor-pointer relative flex justify-center items-center h-[20px] w-full py-[20px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                              <h2 className="text-[1.6rem] font-bold text-center">
                                {item.title}
                              </h2>
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform group-open:hidden">
                                +
                              </span>
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform hidden group-open:inline">
                                -
                              </span>
                            </summary>
                            <div className="w-full h-full border-b-[2px] pb-[10px]">
                              <p className="text-[1.4rem] font-medium text-justify mt-4 px-10">
                                {item.description}
                              </p>
                              <div className="w-full flex flex-row justify-center items-center my-10">
                                <div
                                  className="flex items-center relative mr-10"
                                  onClick={() => handleCheckChange(index)}
                                >
                                  <input
                                    id="slider"
                                    type="checkbox"
                                    checked={checks[index].check}
                                    onChange={() => {}}
                                    className="w-[37px] h-8 bg-gray-300 rounded-full appearance-none cursor-pointer peer"
                                  />
                                  <span
                                    className={`w-8 h-8 bg-white rounded-full transition-transform duration-300 ease-in-out absolute cursor-pointer left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1 border peer-checked:border-none`}
                                  ></span>
                                </div>
                                <div className="flex flex-row items-center justify-center">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={transps[index].transp}
                                    onChange={(e) =>
                                      handleOpacityChange(e, index)
                                    }
                                    className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                  />
                                  <span className="text-[1.5rem] font-semibold text-gray-700 ml-4">
                                    Opacidad:{transps[index].transp}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-start w-full px-[25px] mb-4">
                                <p className="text-[1.3rem]">
                                  Se clasifica en:
                                </p>
                                {item.legend.map((legend, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-center"
                                  >
                                    <div
                                      className="w-8 h-6 mr-2 border border-black"
                                      style={{ backgroundColor: legend.color }}
                                    ></div>
                                    <p className="text-[1.3rem]">
                                      {legend.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        );
                      })}

                    <details key={"umbrales"} className="w-full group">
                      <summary className="cursor-pointer relative flex justify-center items-center h-[30px] w-full py-[25px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                        <h2 className="text-[1.6rem] font-bold text-center">
                          {"Amenaza"}
                        </h2>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform group-open:hidden">
                          +
                        </span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform hidden group-open:inline">
                          -
                        </span>
                      </summary>
                      <div className="w-full h-full border-b-[2px] pb-[10px]">
                        <p className="text-[1.4rem] font-medium text-justify mt-4 px-10">
                          {
                            "Umbrales de intensidad mínima para la ocurrencia de deslizamientos."
                          }
                        </p>
                        <div className="w-full flex flex-row justify-center items-center">
                          <button
                            className="ml-[15px] h-[36px] py-[10px] px-[15px] text-white text-[1.2rem] font-semibold bg-secondary1 rounded-[6px]"
                            onClick={() => {
                              setShowModalGraph(true);
                            }}
                          >
                            Ver Gráficas
                          </button>
                        </div>
                      </div>
                    </details>
                  </>
                ) : null}
              </div>
            </div>
            <div className="w-full h-[30%] flex flex-col">
              <div className="w-full h-[30px] flex justify-center items-center bg-primary2 text-white font-bold text-[1.5rem] border-b-[1px]">
                <i className="fa-solid fa-circle-info mr-[5px]"></i> Información
              </div>
              <div className="h-full w-full flex flex-col overflow-y-auto px-[15px]">
                {listInfo.length > 0 ? (
                  listInfo.map((item) => {
                    return (
                      <div
                        key={item.name}
                        className="w-full py-[10px] flex flex-col justify-center items-start bg-white text-[1.5rem] border-b-[1px]"
                      >
                        <p className="font-bold text-[1.4rem]">{item.name}</p>
                        {item.data.map((data, index) => {
                          return (
                            <p key={index} className="text-[1.2rem]">
                              <span className="font-semibold">{data.name}</span>
                              : {data.value}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[1.3rem]">
                    Seleccione en el mapa la información que desea consultar
                  </p>
                )}
              </div>
            </div>
            {/* <div>
              <button className="w-full h-[30px] bg-primary2 text-white font-bold text-[1.5rem] rounded-b-[10px]">
                <i className="fa-solid fa-arrow-left-long"></i> Regresar al
                DAGRAN
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div
        onClick={() => {
          setIsDropdownOpen(false);
          setIsDropdownOpenSub(false);
        }}
        id="map"
        style={{ height: "100vh", width: "100vw" }}
      ></div>

      {showModalGraph ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden fixed inset-0 z-[9999] outline-none focus:outline-none"
            onClick={() => setShowModalGraph(false)}
          >
            {/* Fondo */}
            <div className="fixed inset-0"></div>

            <div
              className="relative w-[800px] h-[620px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido */}
              <div className="h-full rounded-[6px] relative flex flex-col bg-white outline-none focus:outline-none">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b-[2px] border-solid border-primary2 rounded-t">
                  <h3 className="text-black text-[1.4rem] font-semibold">
                    Amenaza
                  </h3>
                  <button
                    className="mr-[10px]"
                    onClick={() => setShowModalGraph(false)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.7221 5.55127L5.41406 14.8593"
                        stroke="black"
                        stroke-width="1.55134"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.41406 5.55127L14.7221 14.8593"
                        stroke="black"
                        stroke-width="1.55134"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="w-full px-[15px] pb-[15px] h-[580px]">
                  <div>
                    {/* Contenedor de pestañas */}
                    <div className="flex border-b mt-[10px]">
                      {subregionsGraphs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 text-[1.3rem] ${
                            activeTab === tab.id
                              ? "border-b-2 border-secondary1 font-bold text-secondary1"
                              : "text-black"
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {/* Contenido de la pestaña activa */}
                    <div className="mt-4 overflow-y-auto">
                      {subregionsGraphs.map(
                        (tab) =>
                          activeTab === tab.id && (
                            <div key={tab.id} className="p-4 rounded-md">
                              <img
                                className="w-[800px] object-cover"
                                src={`${
                                  tab.url
                                }?timestamp=${new Date().getTime()}`}
                                alt={
                                  "Gráfica Umbrales de lluvia de Subregión" +
                                  tab.name
                                }
                              />
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-[5px]"></div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
