import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import {
  Layout,
  Tree,
  Icon,
  Row,
  Col,
  Button,
  Divider,
  Radio,
  Alert,
  Badge,
  Menu,
  Breadcrumb,
  Tooltip
} from "antd";
import styled from "styled-components";

import withReducer from "../../utils/withReducer";
import withSaga from "../../utils/withSaga";

import { selectModules, addLayers, delLayers } from "./actions";
import makeSelectSider from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import Modules from "./../../data/index";

import {
  CareImg,
  FormProdImg,
  IrrigationImg,
  LayersImg,
  MoneyBagImg,
  PresentationImg,
  QuestionImg,
  TractorImg,
  MapImg,
  LinkImg,
  BaseMapImg
} from "./../../components/Icons";

import Logo from "./../../components/Logo/";
import TareaVida from "./../../components/TareaVida";
import Productive from "./../../components/Productive";
import "./index.css";

const TreeNode = Tree.TreeNode;
const { Sider } = Layout;

const TreeNodeWrapper = styled(TreeNode)`
  .ant-tree-switcher {
    display: none !important;
  }
  .ant-tree-checkbox-checked .ant-tree-checkbox-inner, .ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner {
    background-color:${(props) => props.color};
    border-color: ${(props) => props.color};
  }
  .ant-tree-checkbox-wrapper:hover .ant-tree-checkbox-inner, .ant-tree-checkbox:hover .ant-tree-checkbox-inner, .ant-tree-checkbox-input:focus + .ant-tree-checkbox-inner {
    border-color: ${(props) => props.color};
}
`;

const Div = styled.div`
  max-height: 78vh;
  overflow-y: auto;
`;
const DivText = styled.div`
  margin: 10px 0 0 27px;
  font-size: 15px;
  font-weight: 600;
  color: #1890ff;
`;

const MenuWrapper = styled(Menu)`
  &.ant-menu-inline .ant-menu-item:not(:last-child) {
    margin: 0px;
  }
  &.ant-menu-inline .ant-menu-item {
    margin: 0px;
  }
`;

const ImgInversion = styled.img`
  width: 20px;
  height: 20px;
  margin-top: -5px;
  margin-right: 10px;
  float: left;
`;

const ImgInversionV = styled.img`
  width: 15px;
  height: 15px;
  margin-top: -2px;
  margin-right: 3px;
`;

const Animate = styled.div`
  display: ${props => (props.visible ? "block" : "none")};
`;

const ImgSecondChoice = styled.img`
  width: 20px;
  height: 20px;
  margin: -1px 10px 0px 10px;
`;

const SiderWrapper = styled(Sider)`
  &.ant-layout-sider {
    position: absolute;
    left: 0px;
    z-index: 2000;
    height: 100vh;
  }
  .ant-layout-sider-zero-width-trigger {
    z-index: 2000;
    top: 0px;
  }
`;

const A = styled.a`
  hover {
    background-color: transparent;
    color: #fff;
  }
`;

const DivBotton = styled.div`
  background-color: #eff3f6;
  padding: 10px 0px 10px 0px;
  position: fixed;
  bottom: 0;
  width: 300px;
  box-shadow: 0 12px 0px #d8e0e6;
`;

const TooltipWrapper = styled(Tooltip)`
  &.ant-tooltip {
    z-index: 3000;
  }
`;

class SiderComponent extends Component {
  state = {
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
    checkedNodeKeys: [],
    selectedNodeKeys: [],
    submenu: "rb_layers",
    view: 1,
    layers: [],
    modalVisible: false,
    selectNode: null
  };

  componentWillReceiveProps = nextProps => {
    const { sider } = this.props;
    if (nextProps.sider.item !== sider.item) {
      this.setState({
        checkedKeys: nextProps.sider.layers[nextProps.sider.item]
      });
    }
  };

  onCheck = checkedKeys => {
    const { sider: { item }, add } = this.props;
    add({ item, checkedKeys });
    this.setState({ checkedKeys });
  };

  onNodeCheck = checkedNodeKeys => {
    const { add } = this.props;
    const { selectNode } = this.state;
    add({ item: selectNode.key, checkedKeys: checkedNodeKeys });
    this.setState({ checkedNodeKeys });
  };

  renderTreeNodes = data => {
    const { sider: { item } } = this.props;
    if (!item) return;
    return data[item].map((item, index) => {
      let color = '';
			switch (item.name) {
				case 'Polígonos de suelo afectado':
					color = 'red';
					break;
				case 'Parcelas agrícolas afectadas':
					color = 'blue';
					break;
				case 'Ascenso del nivel medio del mar':
					color = 'green';
					break;
				case 'Área de intrusión marina':
					color = 'orange';
          break;
        default:
        color = null;  
      }
      
      return (
        <TreeNodeWrapper color={color} title={item.name} key={item.name} dataRef={item} />
      );
    });
  };

  renderTreeNodesUrl = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            style={{ fontSize: 11 }}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {this.renderTreeNodesUrl(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode style={{ fontSize: 11 }} {...item} />;
      }
    });
  };

  handleChangeSubMenu = e => {
    this.setState({ submenu: e.target.value });
  };

  handleChangeModule = string => {
    if (string === 1 || string === 2) {
      this.setState({ view: string, submenu: "rb_layers" });
    } else {
      this.setState({ view: 0 });
      this.props.selectModule(string);
    }
  };

  countLayers = layer => {
    const { sider: { layers } } = this.props;
    if (typeof layers[layer] !== "undefined") {
      return layers[layer].length;
    }
    return 1;
  };

  renderBreadcrumb = item => {
    const { selectNode } = this.state;
    let aux;
    switch (item) {
      case "investments":
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={MoneyBagImg} alt="" />Inversiones
          </A>
        );
        break;
      case "irrigation":
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={IrrigationImg} alt="" />Riego
          </A>
        );
        break;
      case "machinery":
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={TractorImg} alt="" />Maquinarias
          </A>
        );
        break;
      case "estructuraAgricola":
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={FormProdImg} alt="" />Sistema de la Agricultura
          </A>
        );
        break;
      case "bases":
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={FormProdImg} alt="" />Bases Cartográficas
          </A>
        );
        break;
      case 2:
        aux = (
          <A href="#" style={{ fontSize: 13 }}>
            <ImgInversionV src={MapImg} alt="" />
            {selectNode ? selectNode.title : null}
          </A>
        );
        break;
      default:
        aux = (
          <A style={{ fontSize: 15 }}>
            <ImgInversionV src={CareImg} alt="" />Tarea Vida
          </A>
        );
        break;
    }

    return (
      <Row style={{ marginBottom: 20 }}>
        <Breadcrumb separator=">">
          <Breadcrumb.Item onClick={this.handleChangeModule.bind(this, 1)}>
            <a style={{ fontSize: 15 }}>
              <Icon type="menu-fold" /> Menu
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{aux}</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
    );
  };

  handleLoad = e => {
    console.log(e);
    this.setState({
      modalVisible: false
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      modalVisible: false
    });
  };

  selectItem = node => {
    this.setState({
      selectNode: node,
      view: 2
    });
  };

  renderRadioView = () => {
    const modules = Modules;
    const { sider: { item, layers }, add, del } = this.props;
    const { submenu } = this.state;

    if (submenu === "rb_layers") {
      return (
        <div>
            {item === 'estructuraAgricola'? (<DivText>Quemado de Güines</DivText>) :null } 

          <Tree
            style={{ fontSize: 11 }}
            checkable
            onCheck={this.onCheck}
            checkedKeys={this.state.checkedKeys}
            selectedKeys={this.state.selectedKeys}
          >
            {this.renderTreeNodes(modules)}
          </Tree>

          {item === "lifeTask" ? (
            <div>
              <TareaVida add={add} del={del} layers={layers.lifeTask || []} />
            </div>
          ) : null}
        </div>
      );
    }
  };

  render() {
    const modules = Modules;
    const {
      sider: { item, layers },
      collapsed,
      onCollapse,
      showModal,
      nodes
    } = this.props;
    const { selectNode, submenu } = this.state;

    return (
      <SiderWrapper
        width={300}
        theme="light"
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
      >
        <Logo />
        <Divider dashed style={{ margin: "5px 0 0 0" }} />
        <Animate visible={this.state.view === 1}>
          <MenuWrapper>
            <Menu.Item
              key="1"
              onClick={this.handleChangeModule.bind(this, "investments")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["investments"] !== "undefined"
                    ? layers["investments"].length
                    : 0
                }
              >
                <ImgInversion src={MoneyBagImg} alt="" />
                <span>Inversiones</span>
              </Badge>
            </Menu.Item>
            <Menu.Item
              key="2"
              onClick={this.handleChangeModule.bind(this, "irrigation")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["irrigation"] !== "undefined"
                    ? layers["irrigation"].length
                    : 0
                }
              >
                <ImgInversion src={IrrigationImg} alt="" />
                <span>Riego</span>
              </Badge>
            </Menu.Item>
            <Menu.Item
              key="3"
              onClick={this.handleChangeModule.bind(this, "machinery")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["machinery"] !== "undefined"
                    ? layers["machinery"].length
                    : 0
                }
              >
                <ImgInversion src={TractorImg} alt="" />
                <span>Maquinarias</span>
              </Badge>
            </Menu.Item>
            <Menu.Item
              key="4"
              onClick={this.handleChangeModule.bind(this, "estructuraAgricola")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["estructuraAgricola"] !== "undefined"
                    ? layers["estructuraAgricola"].length
                    : 0
                }
              >
                <ImgInversion src={FormProdImg} alt="" />
                <span>Sistema de la Agricultura</span>
              </Badge>
            </Menu.Item>
            <Menu.Item
              key="5"
              onClick={this.handleChangeModule.bind(this, "lifeTask")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["lifeTask"] !== "undefined"
                    ? layers["lifeTask"].length
                    : 0
                }
              >
                <ImgInversion src={CareImg} alt="" />
                <span>Tarea Vida</span>
              </Badge>
            </Menu.Item>
            <Menu.Item
              key="6"
              onClick={this.handleChangeModule.bind(this, "bases")}
            >
              <Badge
                style={{ right: -30 }}
                count={
                  typeof layers["bases"] !== "undefined"
                    ? layers["bases"].length
                    : 0
                }
              >
                <ImgInversion src={BaseMapImg} alt="" />
                <span>Bases Cartográficas</span>
              </Badge>
            </Menu.Item>

            {nodes.map((item, index) => {
              return (
                <Menu.Item
                  key={6 + index}
                  onClick={this.selectItem.bind(this, item)}
                >
                  <Badge
                    style={{ right: -30 }}
                    count={
                      typeof layers[item.key] !== "undefined"
                        ? layers[item.key].length
                        : 0
                    }
                  >
                    <ImgInversion src={LinkImg} alt="" />
                    <span>{item.title}</span>
                  </Badge>
                </Menu.Item>
              );
            })}
          </MenuWrapper>
        </Animate>
        <Animate style={{ padding: 10 }} visible={this.state.view === 0}>
          {this.renderBreadcrumb(item)}
          {item && modules[item].length ? (
            <Col>
              <Radio.Group value={submenu} onChange={this.handleChangeSubMenu}>
                <TooltipWrapper placement="top" title={"Capas"}>
                  <Radio.Button size="small" value="rb_layers">
                    <ImgSecondChoice src={LayersImg} alt="" />
                  </Radio.Button>
                </TooltipWrapper>
                <TooltipWrapper
                  placement="top"
                  title={item === "lifeTask" ? "Afectaciones" : "Estadísticas"}
                >
                  <Radio.Button value="rb_chart" disabled={item !== "lifeTask"}>
                    <ImgSecondChoice src={PresentationImg} alt="" />
                  </Radio.Button>
                </TooltipWrapper>
                <TooltipWrapper placement="top" title={"Información"}>
                  <Radio.Button value="rb_info" disabled>
                    <ImgSecondChoice src={QuestionImg} alt="" />
                  </Radio.Button>
                </TooltipWrapper>
              </Radio.Group>
              {this.renderRadioView()}
            </Col>
          ) : item ? item==="estructuraAgricola"? <Productive/> : (<Alert message="No hay capas disponibles" type="info" showIcon />) : null}
        </Animate>
        <Animate style={{ padding: 10 }} visible={this.state.view === 2}>
          {this.renderBreadcrumb(2)}
          <Div>
            {selectNode ? (
              <Tree
                checkable
                onCheck={this.onNodeCheck}
                checkedKeys={this.state.checkedNodeKeys}
                selectedKeys={this.state.selectedNodeKeys}
              >
                {this.renderTreeNodesUrl(selectNode.children)}
              </Tree>
            ) : null}
          </Div>
        </Animate>
        {!collapsed ? (
            <DivBotton>
            <TooltipWrapper
              placement="topLeft"
              title={"Añadir Nodo Predeterminado"}
            >
              <Button
                shape="circle"
                style={{ marginLeft: 19 }}
                type="primary"
                onClick={showModal}
              >
                <ImgInversion
                  style={{ margin: "-2px 0 0 5px" }}
                  src={MapImg}
                  alt=""
                />
              </Button>
            </TooltipWrapper>
          </DivBotton>
        ) : null}
      </SiderWrapper>
    );
  }
}

SiderComponent.defaultProps = {
  sider: {
    item: null,
    layers: []
  }
};

SiderComponent.propTypes = {};

const mapStateToProps = createStructuredSelector({
  sider: makeSelectSider()
});

const withConnect = connect(mapStateToProps, {
  selectModule: selectModules,
  add: addLayers,
  del: delLayers
});

export default compose(
  withConnect,
  withSaga({ key: "sider", saga }),
  withReducer({ key: "sider", reducer })
)(SiderComponent);
