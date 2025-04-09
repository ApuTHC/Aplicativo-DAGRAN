import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import * as EsriLeaflet from "esri-leaflet";
import "esri-leaflet-renderers";
import * as EsriVectorLeaflet from "esri-leaflet-vector";
// import * as EsriLegendLeaflet from "esri-leaflet-legend";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, itemsVisorCategory } from "../../constants/visor";
// import * as Locate from "leaflet.locatecontrol/dist/L.Control.Locate.min.js";
import * as Locate from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { municipios } from "../../constants/municipios";
import { subregiones } from "../../constants/subregiones";
import * as d3 from "d3";

export const Visor = () => {
  type ToggleLayerType = () => void;

  const [currentMuni, setCurrentMuni] = useState<GeoJSON.Feature | undefined>();
  const [currentLayer, setCurrentLayer] = useState<string>("");

  // const featureQuery = EsriLeaflet.query({
  //   url: "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Susceptibilidad/FeatureServer/0",
  // });
  // const layer = L.geoJSON(feature, {
  //   style: { opacity: 0, fillOpacity: 0 },
  // }).addTo(map.current!);
  // layer.on("click", function (e) {
  //   featureQuery
  //     .nearby(e.latlng, 10) // Radio de búsqueda en metros
  //     .run((error, featureCollection) => {
  //       if (error) {
  //         console.error("Error al consultar el Feature Layer:", error);
  //         return;
  //       }
  //       console.log(featureCollection);
  //       if (featureCollection.features.length > 0) {
  //         const properties = featureCollection.features[0].properties;
  //         const popupContent = `
  //           <strong>Susceptibilidad</strong><br>
  //           Tipo de evento: ${properties.Tipo_event}
  //         `;
  //         L.popup()
  //           .setLatLng(e.latlng)
  //           .setContent(popupContent)
  //           .openOn(map.current!);
  //       }
  //     });
  // });

  const drawMaskClipPath = (geojson: GeoJSON.Feature, clipPath: any) => {
    // Limpiar cualquier path previo en el clipPath
    clipPath.selectAll("*").remove();

    const coords = geojson.geometry.coordinates[0][0];
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
    legend: L.Layer | null;
    active: boolean;
    transp: number;
    category: string;
    url: string;
    urlFeat: string;
    ToggleLayer: ToggleLayerType;

    constructor(
      layer: L.TileLayer,
      legend: L.Layer | null,
      active: boolean,
      transp: number,
      category: string,
      url: string,
      urlFeat: string,
      ToggleLayer: ToggleLayerType
    ) {
      this.layer = layer;
      this.legend = null;
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
  ]);
  const [checks, setChecks] = useState([
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
    { check: false },
  ]);

  const map = useRef<L.Map | null>(null);
  const itemsLayerMap = useRef<MapLayer[]>([]);

  const [subregionGraph, setSubregionGraph] = useState<string>("Norte");
  const [subregionArray, setSubregionArray] = useState<string[]>([
    "Norte",
    "Nordeste",
    "Occidente",
    "Oriente",
    "Sureste",
    "Bajo cauca",
  ]);

  const [municipiosName, setMunicipiosName] = useState<string[]>([]);
  const [subregionesName, setSubregionesName] = useState<string[]>([]);
  const [inventario, setInventario] = useState<
    GeoJSON.FeatureCollection | undefined
  >(undefined);
  const [inventarioLayerCluster, setInventarioLayerCluster] = useState<
    L.Layer | undefined
  >(undefined);

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

        while (hasMoreData) {
          const queryUrl = `${url}/query?where=1%3D1&outFields=*&f=geojson&resultOffset=${offset}&resultRecordCount=${recordCount}`;
          const response = await fetch(queryUrl);
          const data = await response.json();

          if (data.features && data.features.length > 0) {
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
        "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Inventario_MenM_DAGRAN/FeatureServer/0";
      fetchFeatureServerGeoJSON(featureServerUrl).then((geojson) => {
        // console.log(geojson); // Agrega el GeoJSON al mapa o guárdalo
        setInventario(geojson);
        const markersCluster = new L.MarkerClusterGroup({
          // spiderfyOnMaxZoom: false,
          // disableClusteringAtZoom: 14,
          clusterPane: "customPane",
        });
        for (const feature of geojson.features) {
          L.geoJson(feature, {
            pointToLayer: (feature, latlng) => {
              return L.marker(latlng).bindPopup(
                Object.keys(feature.properties)
                  .map(function (k) {
                    return k + ": " + feature.properties[k];
                  })
                  .join("<br />"),
                {
                  maxHeight: 200,
                }
              );
            },
            onEachFeature: (feature, layer) => {
              markersCluster.addLayer(layer); // Añadir cada marcador al grupo de clústeres
            },
          });
        }
        setInventarioLayerCluster(markersCluster);
        // map.current?.addLayer(markersCluster);
      });
    }
    ToggleMapLayer();
  }, [checks]);

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
            null,
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
    if (newChecks[id].check) {
      setCurrentLayer(itemsLayerMap.current[id].urlFeat);
    }
    setChecks(newChecks);
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
      setCurrentMuni(feature);
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
    const pane = map.current?.getPane("customPane");
    if (pane) {
      pane.style.clipPath = "";
    }
  };

  return (
    <div>
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
      <div className="fixed z-[500] h-[100vh] w-[500px] flex justify-center items-start">
        <div
          onClick={() => {
            setIsDropdownOpen(false);
            setIsDropdownOpenSub(false);
          }}
          className="h-[95vh] w-[470px] bg-white opacity-90 rounded-[10px] mt-[15px] flex flex-col"
        >
          <div className="w-full h-[15%] flex flex-col items-center justify-center text-center">
            <h1 className="text-[8rem] font-black leading-none">VER</h1>
            <h2 className="text-[2.5rem] font-medium">
              Visor de Escenarios de Riesgo
            </h2>
          </div>
          <div className="w-full h-[85%] flex flex-col justify-between">
            <div>
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
                        <summary className="cursor-pointer relative flex justify-center items-center h-[30px] w-full py-[25px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                          <h2 className="text-[2rem] font-bold text-center">
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
                          <p className="text-[1.7rem] font-medium text-justify mt-4 px-10">
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
                                className={`w-8 h-8 bg-white rounded-full transition-transform duration-300 ease-in-out absolute left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1 border peer-checked:border-none`}
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
                            <p className="text-[1.5rem]">Se clasifica en:</p>
                            {item.legend.map((legend, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-center"
                              >
                                <div
                                  className="w-8 h-6 mr-2 border border-black"
                                  style={{ backgroundColor: legend.color }}
                                ></div>
                                <p className="text-[1.5rem]">{legend.value}</p>
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
                    {itemsVisorCategory.length > 0 &&
                      itemsVisorCategory.map((item, index) => {
                        if (item.category !== "menm") return null;
                        return (
                          <details key={index} className="w-full group">
                            <summary className="cursor-pointer relative flex justify-center items-center h-[30px] w-full py-[25px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                              <h2 className="text-[2rem] font-bold text-center">
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
                              <p className="text-[1.7rem] font-medium text-justify mt-4 px-10">
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
                                    className={`w-8 h-8 bg-white rounded-full transition-transform duration-300 ease-in-out absolute left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1 border peer-checked:border-none`}
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
                                <p className="text-[1.5rem]">
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
                                    <p className="text-[1.5rem]">
                                      {legend.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        );
                      })}
                    <details key={"inventario"} className="w-full group">
                      <summary className="cursor-pointer relative flex justify-center items-center h-[30px] w-full py-[25px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                        <h2 className="text-[2rem] font-bold text-center">
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
                        <p className="text-[1.7rem] font-medium text-justify mt-4 px-10">
                          {
                            "Recopilación de eventos morfodinámicos en Antioquia."
                          }
                        </p>
                      </div>
                    </details>
                    <details key={"umbrales"} className="w-full group">
                      <summary className="cursor-pointer relative flex justify-center items-center h-[30px] w-full py-[25px] bg-white text-[1.4rem] font-medium leading-[13px] border-b-[2px] group-open:border-b-0">
                        <h2 className="text-[2rem] font-bold text-center">
                          {"Umbrales de Lluvia"}
                        </h2>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform group-open:hidden">
                          +
                        </span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] font-bold transition-transform hidden group-open:inline">
                          -
                        </span>
                      </summary>
                      <div className="w-full h-full border-b-[2px] pb-[10px]">
                        <p className="text-[1.7rem] font-medium text-justify mt-4 px-10">
                          {
                            "Umbrales de intensidad mínima para la ocurrencia de deslizamientos."
                          }
                        </p>
                        <label className="ml-[25px] text-[1.3rem]">Seleccione la Subregión: </label>
                        <select
                          name="subre"
                          id="subre"
                          className="!w-[156px] h-[36px] text-[1.3rem] font-normal rounded-[6px] border-[1px] bg-white"
                          onChange={(e) => {
                            setSubregionGraph(e.target.value);
                          }}
                        >
                          {subregionArray.map((subregion, index) => (
                            <option key={"subs_" + index} value={subregion}>
                              {subregion}
                            </option>
                          ))}
                        </select>
                        <button className="ml-[15px] h-[36px] py-[10px] px-[15px] text-white text-[1.2rem] font-semibold bg-secondary1 rounded-[6px]">Ver Gráfica</button>
                      </div>
                    </details>
                  </>
                ) : null}
              </div>
            </div>
            <div>
              <button className="w-full h-14 bg-primary2 text-white font-bold text-[1.5rem] border-b-[1px]">
                <i className="fa-solid fa-map"></i> Mapas Base
              </button>
              <button className="w-full h-14 bg-primary2 text-white font-bold text-[1.5rem] border-b-[1px]">
                <i className="fa-solid fa-circle-info"></i> Información
              </button>
              <button className="w-full h-14 bg-primary2 text-white font-bold text-[1.5rem] rounded-b-[10px]">
                <i className="fa-solid fa-arrow-left-long"></i> Regresar al
                DAGRAN
              </button>
            </div>
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
    </div>
  );
};
