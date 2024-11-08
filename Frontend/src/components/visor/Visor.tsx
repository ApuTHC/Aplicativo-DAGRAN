import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import * as EsriLeaflet from "esri-leaflet";
import "esri-leaflet-renderers";
import * as EsriVectorLeaflet from "esri-leaflet-vector";
import * as EsriLegendLeaflet from "esri-leaflet-legend";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, itemsVisorCategory } from "../../constants/visor";

export const Visor = () => {
  type ToggleLayerType = () => void;

  class MapLayer {
    layer: L.TileLayer;
    legend: L.Layer | null;
    active: boolean;
    transp: number;
    url: string;
    ToggleLayer: ToggleLayerType;

    constructor(
      layer: L.TileLayer,
      legend: L.Layer | null,
      active: boolean,
      transp: number,
      url: string,
      ToggleLayer: ToggleLayerType
    ) {
      this.layer = layer;
      this.legend = null;
      this.active = active;
      this.transp = transp;
      this.url = url;
      this.ToggleLayer = ToggleLayer;
    }
  }

  const ToggleMapLayer = () => {
    console.log("Cargando capa en el mapa");
  };

  const [currentCategory, setCurrentCategory] = useState<string>(categories[0]);
  const [currentItem, setCurrentItem] = useState<string>(
    itemsVisorCategory[0].title
  );
  const [transps, setTranspas] = useState([
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
  ]);

  const map = useRef<L.Map | null>(null);
  const itemsLayerMap = useRef<MapLayer[]>([]);

  useEffect(() => {
    if (!map.current) {
      map.current = L.map("map", { maxZoom: 25 }).setView([7.1, -76.5], 8);
      map.current.createPane("hillshadePane");
      map.current.createPane("imagePane");
      const hillshadePane = map.current.getPane("hillshadePane");
      const imagePane = map.current.getPane("imagePane");

      if (hillshadePane) {
        hillshadePane.style.zIndex = "0"; // Asignación de zIndex como string
      }
      if (imagePane) {
        imagePane.style.zIndex = "10"; // Asignación de zIndex como string
      }

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
      EsriLeaflet.basemapLayer("ImageryLabels", { pane: "imagePane" }).addTo(
        map.current
      );

      EsriLeaflet.featureLayer({
        url: "https://services7.arcgis.com/gTVMpnerZFjZtXQb/arcgis/rest/services/Antioquia_25K_DAGRAN/FeatureServer/0",
        cacheLayers: true,
        simplifyFactor: 0.9,
        precision: 5,
        renderer: L.canvas(),
      }).addTo(map.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (itemsLayerMap.current.length === 0) {
      itemsVisorCategory.map((item) => {
        itemsLayerMap.current.push(
          new MapLayer(
            EsriLeaflet.tiledMapLayer({
              url: item.url,
              maxZoom: 25,
            }),
            null,
            false,
            1,
            item.url,
            ToggleMapLayer
          )
        );
      });
    }

    console.log(itemsLayerMap.current);
  });

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

  const handleCheckChange = (
    id: number
  ) => {
    const newChecks = [...checks];
    newChecks[id].check = !newChecks[id].check;
    setChecks(newChecks);

    if (newChecks[id].check) {
      if(map.current){
        itemsLayerMap.current[id].layer.addTo(map.current);
      }
    } else {
      map.current?.removeLayer(itemsLayerMap.current[id].layer);
    }

  };

  return (
    <div>
      <div className="fixed z-[9999] h-[100vh] w-[560px] flex justify-center items-start">
        <div className="h-[95vh] w-[450px] bg-white opacity-85 rounded-[10px] mt-[15px] flex flex-col">
          <div className="w-full h-[15%] flex flex-col items-center justify-center text-center">
            <h1 className="text-[8rem] font-black leading-none">VER</h1>
            <h2 className="text-[2rem]">Visor de Escenarios de Riesgo</h2>
          </div>
          <div className="w-full h-[85%] flex flex-col">
            <nav className="m-2 border-b-2">
              <ul className="flex flex-row flex-wrap justify-start">
                {categories.map((category, index) => (
                  <li
                    key={index}
                    className={`relative ${
                      currentCategory === category
                        ? "text-black before:block before:absolute before:-left-5 before:top-2 before:bg-primary1 before:w-[9px] before:h-[17px]"
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
                itemsVisorCategory.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-2 border-b cursor-pointer"
                    onClick={() => setCurrentItem(item.title)}
                  >
                    <h3 className="text-[2rem] font-bold text-center">
                      {item.title}
                    </h3>
                    {currentItem === item.title &&
                      itemsLayerMap.current.length > 0 && (
                        <>
                          <p className="text-[1.7rem] font-medium text-justify mt-4 px-10">
                            {item.description}
                          </p>
                          <div className="w-full flex flex-row justify-center items-center my-10">
                            <div className="flex items-center relative mr-10">
                              <input
                                id="slider"
                                type="checkbox"
                                checked={checks[index].check}
                                onChange={() => handleCheckChange(index)}
                                className="w-12 h-6 bg-gray-300 rounded-full appearance-none cursor-pointer peer"
                              />
                              <span
                                className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out absolute left-0 top-0 peer-checked:translate-x-6 peer-checked:bg-primary1`}
                              ></span>
                            </div>
                            <div className="flex flex-row items-center justify-center">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={transps[index].transp}
                                onChange={(e) => handleOpacityChange(e, index)}
                                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <span className="text-[1.5rem] font-semibold text-gray-700 ml-4">
                                {transps[index].transp}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div id="map" style={{ height: "100vh", width: "100vw" }}></div>
    </div>
  );
};
