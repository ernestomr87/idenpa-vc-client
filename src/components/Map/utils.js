import {
  message
} from "antd";

import OlSourceXYS from "ol/source/xyz";
import OlSourceTileWMS from "ol/source/tilewms";
import OlLayerTile from "ol/layer/tile";
import OlView from "ol/view";
import OlMap from "ol/map";
import OlSourceVector from "ol/source/vector";
import OlLayerVector from "ol/layer/vector";
import OlStroke from "ol/style/stroke";
import OlFill from "ol/style/fill";
import OlStyle from "ol/style/style";
import OlStyleText from "ol/style/text";
import OlStyleFill from "ol/style/fill";
import OlStyleStroke from "ol/style/stroke";
import OlCircle from "ol/style/circle";
import OlFormatGeoJSON from "ol/format/geojson";

import OLSourceOSM from 'ol/source/osm';

import colors from "./../../utils/colors";

import config from "./../../config";

// var osm = new OlLayerTile({
//   name: "tms",
//   projection: "EPSG:4326",
//   source: new OlSourceXYS({
//     url: "http://ide.enpa.minag.cu/geoserver/www/tms/2017/osmmapmapnik/{z}/{x}/{-y}.png"
//   }),
//   type: "base"
// });

var satelite = new OlLayerTile({
  name: "tms",
  projection: "EPSG:4326",
  source: new OlSourceXYS({
    url: "http://ide.enpa.minag.cu/geoserver/www/tms/2017/sat/{z}/{x}/{-y}.jpg"
  }),
  type: "base"
});

// var bings = new OlLayerTile({
//   name: "tms",
//   projection: "EPSG:4326",
//   source: new BingMaps({
//     key: 'AifwTHqYsEbvQy6u9dXXiG22H45XSZaCe22JdZmpuwDvWLxtqTjmcN5Br5DueBBA',
//     imagerySet: "RoadOnDemand"
//   }),
//   type: "base"
// });

var osm = new OlLayerTile({
  name: "tms",
  projection: "EPSG:4326",
  source: new OLSourceOSM(),
  type: "base"
});


const map = new OlMap({
  view: new OlView({
    projection: "EPSG:4326",
    center: [-80.009, 22.5083],
    zoom: 9
  }),
  controls: [],
  layers: [osm]
});

const changeMap = () => {
  let layers = map.getLayers();
  if (layers.getArray().includes(satelite)) {
    layers.insertAt(0, osm);
    map.removeLayer(satelite);
    return 1;
  } else if (layers.getArray().includes(osm)) {
    layers.insertAt(0, satelite);
    map.removeLayer(osm);
    return 0;
  }
};

const listLayerByNode = node => {
  let array = [];

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].children) {
        for (let j = 0; j < node.children[i].children.length; j++) {
          if (node.children[i].children[j].children) {
            for (
              let x = 0; x < node.children[i].children[j].children.length; x++
            ) {
              array.push(node.children[i].children[j].children[x]);
            }
          } else {
            array.push(node.children[i].children[j]);
          }
        }
      } else {
        array.push(node.children[i]);
      }
    }
  }
  return array;
};

const categoryToRoman = cat => {
  var categoryToNumber = parseFloat(cat);
  if (categoryToNumber < 2) return "Categoria I";
  else if (categoryToNumber < 3) return "Categoria II";
  else if (categoryToNumber < 3.7) return "Categoria III";
  return "Categoria IV";
};

const addLayer = (newLayers, oldLayers, name = "") => {
  let diff;
  let important = null;
  for (let j = 0; j < newLayers.length; j++) {
    let exist = false;
    for (let i = 0; i < oldLayers.length; i++) {
      if (
        !oldLayers[i].node &&
        newLayers[j].name === oldLayers[i].item.name &&
        newLayers[j].json === oldLayers[i].item.json
      ) {
        exist = true;
        break;
      }
    }
    if (!exist) {
      diff = newLayers[j];
      break;
    }
  }
  if (!diff) return;
  let aux;
  let color = colors.shift();

  diff["color"] = color;
  var style = new OlStyle({
    stroke: new OlStroke({
      color: '#f00',
    }),
    fill: new OlFill({
      color: 'rgba(255,0,0,0.1)'

    }),
    text: new OlStyleText({
      font: "12px Calibri,sans-serif",
      fill: new OlFill({
        color
      }),
      stroke: new OlStroke({
        color: "#ffffff",
        width: 4
      }),
      offsetX: 0,
      offsetY: -13,
    }),
    image: new OlCircle({
      radius: 6,
      fill: new OlStyleFill({
        color
      }),
      stroke: new OlStyleStroke({
        color: '#ffffff',
        width: 1
      })
    })
  });

  let source;
  if (diff.wms) {
    let paramLayers = {
      'LAYERS': '',
      'TILED': true
    };
    paramLayers.LAYERS = diff.wms

    source = new OlSourceTileWMS({
      url: config.geoServerWms,
      params: paramLayers,
    });
    aux = new OlLayerTile({
      source,
      style: diff.style || function (feature) {
        const name = feature.get('nombre');
        if (name) {
          style.getText().setText(name);
        }
        return style;
      }
    });
  } else {
    source = new OlSourceVector({
      format: new OlFormatGeoJSON(),
      url: diff.json
    })
    if (diff.opacity) {
      aux = new OlLayerVector({
        source,
        style: diff.style || function (feature) {
          const name = feature.get('nombre');
          if (name) {
            style.getText().setText(name);
          }
          return style;
        },
        opacity: diff.opacity
      });
    } else {
      aux = new OlLayerVector({
        source,
        style: diff.style || function (feature) {
          const name = feature.get('nombre');
          if (name) {
            style.getText().setText(name);
          }
          return style;
        },
      });
    }


  }

  //Aki abajo es donde se juega con los distintos tipos de afectaciones

  if (diff.name === "Polígonos de suelo afectado") {
    important = {
      name: diff.name,
      ol_uid: aux.ol_uid
    };
  }

  if (diff.name === "Parcelas agrícolas afectadas") {
    important = {
      name: diff.name,
      ol_uid: aux.ol_uid
    };
  }

  if (diff.name === "Ascenso del nivel medio del mar") {
    important = {
      name: diff.name,
      ol_uid: aux.ol_uid
    };
  }

  return new Promise((resolve, reject) => {
    if (
      !map
        .getLayers()
        .getArray()
        .includes(aux)
    ) {
      oldLayers.push({
        item: diff,
        layer: aux,
        node: false
      });
      try {
        map.addLayer(aux);
        aux.getSource().on("change", function (data) {
          message.success(`Capa "${diff.name}" cargada.`, 1);
          aux.getSource().removeEventListener("change");
          resolve({
            oldLayers,
            important
          });
        });

      } catch (err) {
        console.log(err);
        reject(err);
      }
    }
  });
};

const addLayerFromNode = (newLayers, oldLayers) => {
  newLayers.map(item => {
    let aux = item.layer;

    if (
      !map
        .getLayers()
        .getArray()
        .includes(aux)
    ) {
      oldLayers.push({
        item: item.key,
        name: item.title,
        layer: aux,
        node: true
      });
      try {
        map.addLayer(aux);
        aux.getSource().on("change", function () {
          message.success(`Capa "${item.title}" cargada.`, 1);
        });
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    return oldLayers;
  });
  return oldLayers;
};

const removeLayer = (array, arrayN, oldLayers) => {
  let nlayers = [];
  let nlayers2 = [];
  let diff = [];
  if (array.length) {
    oldLayers.map(lItem => {
      let exist = array.filter(aItem => {
        if (aItem.name === lItem.item.name && aItem.json === lItem.item.json) {
          return lItem;
        }
        return null;
      });
      if (!exist.length) {
        diff.push(lItem);
      } else {
        nlayers.push(lItem);
      }
      return null;
    });

    diff.map(item => {
      if (
        map
          .getLayers()
          .getArray()
          .includes(item.layer)
      ) {
        map.removeLayer(item.layer);
        colors.push(item.color);
      }
      return null;
    });
  } else {
    diff = oldLayers.filter(lItem => {
      if (lItem.node) {
        nlayers.push(lItem);
      } else {
        return lItem;
      }
      return null;
    });
    diff.map(item => {
      if (
        map
          .getLayers()
          .getArray()
          .includes(item.layer)
      ) {
        map.removeLayer(item.layer);
        colors.push(item.color);
      }
      return null;
    });
  }

  if (arrayN.length) {
    nlayers.map(lItem => {
      let exist = arrayN.filter(aItem => {
        if (aItem.key === lItem.item && lItem.node) {
          return lItem;
        }
        return null;
      });
      if (!exist.length) {
        diff.push(lItem);
      } else {
        nlayers2.push(lItem);
      }
      return null;
    });

    diff.map(item => {
      if (
        map
          .getLayers()
          .getArray()
          .includes(item.layer)
      ) {
        map.removeLayer(item.layer);
        colors.push(item.color);
      }
      return null;
    });
  } else {
    diff = nlayers.filter(lItem => {
      if (!lItem.node) {
        nlayers2.push(lItem);
      } else {
        return lItem;
      }
      return null;
    });
    diff.map(item => {
      if (
        map
          .getLayers()
          .getArray()
          .includes(item.layer)
      ) {
        map.removeLayer(item.layer);
        colors.push(item.color);
      }
      return null;
    });
  }

  return nlayers2;
};

const showLayerByCategoryAgroproductividad = (ol_uid, interaction) => {
  map.getLayers().forEach(item => {
    if (item.ol_uid === ol_uid) {
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          feature.set("hoverStyle", false);
          return null;
        });
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          var cat = feature.get("cat_gral10_cult");
          if (interaction.municipio) {
            interaction.data.map(category => {
              if (
                categoryToRoman(cat) === category.key &&
                feature.get("municipio") === interaction.municipio
              ) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          } else {
            interaction.data.map(category => {
              if (categoryToRoman(cat) === category.key) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          }
          return null;
        });
    }
  });
};

const showLayerByNameParcelasAfectadas = (ol_uid, interaction) => {
  map.getLayers().forEach(item => {
    if (item.ol_uid === ol_uid) {
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          feature.set("hoverStyle", false);
          return null;
        });
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          var nombre_tipo_us = feature.get("nombre_tipo_uso");
          if (interaction.municipio) {
            interaction.data.map(item => {
              if (
                nombre_tipo_us === item.key &&
                feature.get("municipio_nombre") === interaction.municipio
              ) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          } else {
            interaction.data.map(item => {
              if (nombre_tipo_us === item.key) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          }
          return null;
        });
    }
  });
};

const showLayerByAreaAscensoDelMar = (ol_uid, interaction) => {
  map.getLayers().forEach(item => {
    if (item.ol_uid === ol_uid) {
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          feature.set("hoverStyle", false);
          return null;
        });
      item
        .getSource()
        .getFeatures()
        .map(feature => {
          var area = feature.get("area");
          if (interaction.municipio) {
            interaction.data.map(item => {
              if (
                area === item.area &&
                feature.get("municipio") === interaction.municipio
              ) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          } else {
            interaction.data.map(item => {
              if (area === item.area) {
                feature.set("hoverStyle", true);
              }
              return null;
            });
          }
          return null;
        });
    }
  });
};

const addLayerByGeom = (geom) => {
  // var vectorSource = new OlSourceVector({
  //   features: (new OlFormatGeoJSON()).readFeatures(geom)
  // });



  let source = new OlSourceVector({
    format: new OlFormatGeoJSON(),
    url: 'http://localhost:3001/api/sitema_agricola/forma_prodictiva/725637272/usoTenencia',
  })
  let aux = new OlLayerVector({
    source,
  });

  map.addLayer(aux);
  // aux.getSource().on("change", function (data) {
  //   message.success(`Capa "${diff.name}" cargada.`, 1);
  //   aux.getSource().removeEventListener("change");
  //   resolve({
  //     oldLayers,
  //     important
  //   });
  // });
}

export default map;
export {
  listLayerByNode,
  addLayer,
  addLayerFromNode,
  removeLayer,
  changeMap,
  showLayerByCategoryAgroproductividad,
  showLayerByNameParcelasAfectadas,
  showLayerByAreaAscensoDelMar,
  addLayerByGeom
};