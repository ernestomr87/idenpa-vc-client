import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { Layout, Modal, Form, Col, Radio } from "antd";

import reducer from "./reducer";
import saga from "./saga";
import withReducer from "../../utils/withReducer";
import withSaga from "../../utils/withSaga";

import makeSelectSider from "./../Sider/selectors";
import makeSelectVisor from "./selectors";
import { addNodeRequest, addNodeResponse } from "./actions";

import Map from "./../../components/Map/";
import Sider from "./../Sider";
import { nodes as nodesList, node_services } from "./../../data/index";

import "./index.css";

const { Content } = Layout;
const RadioGroup = Radio.Group;

class Visor extends Component {
  state = {
    collapsed: false,
    visible: false,
    node: 0
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false
    });

    this.addNodo();
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
    });
  };

  handleChange = e => {
    console.log("radio checked", e.target.value);
    this.setState({
      node: e.target.value
    });
  };

  addNodo = () => {
    const { node } = this.state;
    let nodeUrl = `${nodesList[node].url}${node_services}`;
    this.props.addNodeReq({ nodeUrl, title: nodesList[node].name });
    this.handleCancel();
  };

  render() {
    const { sider: { layers }, visor: { nodes, interaction } } = this.props;
    if (interaction) {
      //console.log(interaction.data);
    }
    //console.log(interaction);
    // console.log(this.props + " " + "props");
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px"
    };

    const nodesOptions = nodesList.map((item, index) => (
      <Col key={"nodelist" + index} xs={24} sm={12}>
        <Radio style={radioStyle} value={index}>
          {item.name}
        </Radio>
      </Col>
    ));

    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          showModal={this.showModal}
          nodes={nodes}
        />
        <Layout>
          <Content>
            <Map layers={layers} nodes={nodes} drawer={this.state.collapsed} interaction={interaction}
            />
          </Content>
        </Layout>
        <Modal
          title="Nodos Predeterminados"
          wrapClassName="vertical-center-modal"
          zIndex={2000}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          cancelText="Cancelar"
          okText="Cargar"
        >
          <RadioGroup onChange={this.handleChange} value={this.state.node}>
            {nodesOptions}
          </RadioGroup>
        </Modal>
      </Layout>
    );
  }
}

Visor.defaultProps = {
  sider: {
    item: null,
    layers: []
  },
  visor: {
    nodes: [],
    loading: false,
    error: false
  }
};

Visor.propTypes = {};

const mapStateToProps = createStructuredSelector({
  sider: makeSelectSider(),
  visor: makeSelectVisor()
});

const withConnect = connect(mapStateToProps, {
  addNodeReq: addNodeRequest,
  addNodeRes: addNodeResponse
});

export default compose(
  withConnect,
  withSaga({ key: "visor", saga }),
  withReducer({ key: "visor", reducer })
)(Form.create()(Visor));
