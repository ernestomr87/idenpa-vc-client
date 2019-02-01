import React, { Component } from "react";
import { Table, Tabs, message, Button, Row, Col, Modal } from "antd";
import _ from "lodash";
import {
  fetchParcelasAfectadas,
  fetchParcelasAfectadasByMun
} from "./../../services";
import styled from "styled-components";
import { G2, Chart, Tooltip, Geom, Axis } from "bizcharts";

const TabPane = Tabs.TabPane;

const P = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  display: block;
  font-family: "Monospaced Number", "Chinese Quote", -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin-bottom: 15px;
`;

const Div = styled.div``;
const TabsWrapper = styled(Tabs)`
  &.ant-tabs-tab {
    margin: 0 !important;
  }
`;
const numberToLetter = number => {
  const letters = {
    10: "a",
    11: "b",
    12: "c",
    13: "d",
    14: "e",
    15: "f"
  };

  for (var j = 0; j < 6; j++) {
    if (number == Object.keys(letters)[j]) {
      number = Object.values(letters)[j];
      break;
    }
  }

  return number;
};

const getRandomColor = () => {
  let number;
  let color = "#";

  for (let i = 0; i < 6; i++) {
    number = Math.round(Math.random() * 15);

    // Change the number to the letter
    if (number > 9) {
      number = numberToLetter(number);
    }

    color += number;
  }

  return color;
};

const TableWrapper = styled(Table)`
  .ant-table {
    border: none;
  }
`;

export default class ParcelasAfectadas extends Component {
  state = {
    total: null,
    municipios: {},
    selectedTotalRowKeys: [],
    selectedMunicipioRowKeys: [],
    selectedTab: 1,
    selectedRowKeys: [],
    modalTotal: false
  };

  componentWillMount = () => {
    this.fetchTotalData();
    this.fetchMunData("SAGUA LA GRANDE");
    this.fetchMunData("Encrucijada");
    this.fetchMunData("CAIBARIEN");
    this.fetchMunData("CAMAJUANÍ");
  };

  fetchTotalData = () => {
    const _this = this;
    fetchParcelasAfectadas()
      .then(function(response) {
        _this.setState({
          total: response.data
        });
      })
      .catch(function(error) {
        // handle error
        message.error(error.message);
      });
  };

  fetchMunData = mun => {
    const _this = this;
    let municipios = this.state.municipios;
    fetchParcelasAfectadasByMun(mun)
      .then(function(response) {
        municipios[mun] = response.data;
        _this.setState({
          municipios: municipios
        });
      })
      .catch(function(error) {
        // handle error
        message.error(error.message);
      });
  };

  renderTotal = () => {
    const { total, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys });
        this.props.selectedRows(null, selectedRows);
      }
    };

    let dataSource = total;

    if (dataSource) {
      dataSource = dataSource.map(item => {
        let color = getRandomColor();
        item.area = _.floor(item.area, 2);
        item["color"] = color;
        return item;
      });

      // Propiedades de las columnas de la Tabla
      const columns = [
        {
          title: "Nombre",
          dataIndex: "nombre",
          key: "nombre",
          align: "left"
        },
        {
          title: "Área (ha)",
          dataIndex: "area",
          key: "area",
          align: "rigth",
          width: "75px"
        }
      ];

      let max = 0;
      dataSource.forEach(function(obj) {
        if (obj.area > max) {
          max = obj.area;
        }
      });

      G2.Shape.registerShape("interval", "sliceShape", {
        draw(cfg, container) {
          const points = cfg.points;
          const origin = cfg.origin._origin;
          const percent = origin.area / max;
          const xWidth = points[2].x - points[1].x;
          const width = xWidth * percent;
          let path = [];
          path.push(["M", points[0].x, points[0].y]);
          path.push(["L", points[1].x, points[1].y]);
          path.push(["L", points[0].x + width, points[2].y]);
          path.push(["L", points[0].x + width, points[3].y]);
          path.push("Z");
          path = this.parsePath(path);
          return container.addShape("path", {
            attrs: {
              fill: cfg.color,
              path: path
            }
          });
        }
      });

      return (
        <div>
          <Row type="flex" justify="end">
            <Col span={6}>
              <Button
                onClick={() => this.setModalTotal(true)}
                style={{ marginBottom: 10 }}
                type="primary"
                icon="pie-chart"
              >
                Gráfico
              </Button>
            </Col>
          </Row>
          <TableWrapper
            style={{ border: "none" }}
            pagination={false}
            rowSelection={rowSelection}
            size="small"
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      );
    }
  };

  renderMunicipio = municipio => {
    console.log(municipio);
    const { municipios, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys });
        this.props.selectedRows(municipio, selectedRows);
      }
    };

    console.log(municipios);
    console.log(municipios[municipio]);

    // let dataSource = municipios[municipio];
    // if (dataSource) {
    //   dataSource = dataSource.map(item => {
    //     let color = getRandomColor();
    //     item.area = _.floor(item.area, 2);
    //     item["color"] = color;
    //     return item;
    //   });

    const dataSource = [];
    if (municipios[municipio]) {
      Object.keys(municipios[municipio]).forEach(function(key) {
        let cat = municipios[municipio][key].cat;
        let area = municipios[municipio][key].area;
        dataSource.push({ key: cat, value: area });
      });

      const columns = [
        {
          title: "Nombre",
          dataIndex: "nombre",
          key: "nombre",
          align: "left"
        },
        {
          title: "Área (ha)",
          dataIndex: "area",
          key: "area",
          align: "rigth",
          width: "75px"
        }
      ];
      return (
        <div>
          <Row type="flex" justify="end">
            <Col span={6}>
              <Button
                onClick={() => this.setModalMunicipio(municipio)}
                style={{ marginBottom: 10 }}
                type="primary"
                icon="pie-chart"
              >
                Gráfico
              </Button>
            </Col>
          </Row>
          <TableWrapper
            style={{ border: "none" }}
            pagination={false}
            rowSelection={rowSelection}
            size="small"
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      );
    }
  };

  onSelectMunicipioChange = selectedMunicipioRowKeys => {
    console.log("selectedRowKeys changed: ", selectedMunicipioRowKeys);
    this.setState({ selectedMunicipioRowKeys });
  };

  onSelectTotalChange = selectedTotalRowKeys => {
    this.changeLayer("total", selectedTotalRowKeys);
    this.setState({ selectedTotalRowKeys });
  };

  changeTab = key => {
    this.setState({ selectedRowKeys: [] });
    this.props.selectedRows(null, []);
  };

  changeLayer = (type, rows) => {
    if (type === "total") {
      rows.map(item => {
        console.log(this.state.total[item]);
      });
    }
  };

  setModalTotal = () => {
    let dataSource = this.state.total;
    dataSource = dataSource.map(item => {
      let color = getRandomColor();
      item.area = _.floor(item.area, 2);
      item["color"] = color;
      item["name"] = item.nombre;
      return item;
    });

    let max = 0;
    dataSource.forEach(function(obj) {
      if (obj.area > max) {
        max = obj.area;
      }
    });

    const scale = {
      nombre: { alias: "Nombre" },
      area: { alias: "Área (ha)" }
    };

    Modal.info({
      width: "50%",
      title: "Gráfico Parcelas afectadas por tipo de uso ",
      content: (
        <div>
          <Chart data={dataSource} scale={scale} forceFit>
            <Axis title name="nombre" visible={false} />

            <Tooltip crosshairs={{ type: "rect" }} />
            <Geom type="interval" position="nombre*area" color="color" />
          </Chart>
        </div>
      ),
      onOk() {}
    });
  };

  setModalMunicipio = municipio => {    
    let dataSource = this.state.municipios;
    console.log(dataSource + " " + "dataSource = this.state.municipios;");
    dataSource = dataSource[municipio];
    console.log(dataSource + " " + "dataSource = dataSource[municipio]");
    dataSource = dataSource.map(item => {
      let color = getRandomColor();
      item.area = _.floor(item.area, 2);
      item["color"] = color;
      item["name"] = item.nombre;
      return item;
    });

    let max = 0;
    dataSource.forEach(function(obj) {
      if (obj.area > max) {
        max = obj.area;
      }
    });
    const scale = {
      nombre: { alias: "Nombre" },
      area: { alias: "Área (ha)" }
    };

    Modal.info({
      width: "50%",
      title: "Gráfico Parcelas afectadas por tipo de uso ",
      content: (
        <div>
          <Chart data={dataSource} scale={scale} forceFit>
            <Axis title name="nombre" visible={false} />

            <Tooltip crosshairs={{ type: "rect" }} />
            <Geom type="interval" position="nombre*area" color="color" />
          </Chart>
        </div>
      ),
      onOk() {}
    });
  };

  render() {
    return (
      <div>
        <P>Parcelas afectadas por tipo de uso</P>

        <TabsWrapper
          size="small"
          defaultActiveKey={this.state.selectedTab}
          onChange={this.changeTab}
        >
          <TabPane tab="Total" key={1}>
            {this.renderTotal()}
          </TabPane>
          <TabPane tab="Sagua la Grande" key={2}>
            {this.renderMunicipio("SAGUA LA GRANDE")}
          </TabPane>
          <TabPane tab="Encrucijada" key={3}>
            {this.renderMunicipio("Encrucijada")}
          </TabPane>
          <TabPane tab="Caibarién" key={4}>
            {this.renderMunicipio("CAIBARIEN")}
          </TabPane>
          <TabPane tab="Camajuaní" key={5}>
            {this.renderMunicipio("CAMAJUANÍ")}
          </TabPane>
        </TabsWrapper>
      </div>
    );
  }
}