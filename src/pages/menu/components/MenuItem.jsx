import React, { Component } from "react";
import { Modal, Button, Input, Tag, Icon } from "antd";
import styles from "./menuitem.less";
import IconList from "./IconList.jsx";
import util from "../../../utils/pinyin";

const R = require("ramda");

const mapPropsToState = props => ({
  visible: props.visible,
  menuItem: props.menuItem,
  editMode: props.editMode
});

class MenuItem extends Component {
  constructor(props) {
    super(props);
    this.state = mapPropsToState(props);
  }

  static getDerivedStateFromProps(props, state) {
    if (
      // R.equals(props.visible, state.visible) ||
      // (props.editMode && R.isNil(props.menuItem))
      R.equals(props, state)
    ) {
      return null;
    }
    return mapPropsToState(props);
  }

  handleOk = e => {
    this.props.onChange(this.state.menuItem);
    this.props.onCancel(false);
  };

  handleCancel = e => {
    this.props.onCancel(false);
  };

  toggleIconList = iconVisible => {
    this.setState({
      iconVisible
    });
  };

  chooseIcon = () => {
    this.toggleIconList(true);
  };

  updateIcon = icon => {
    let { menuItem } = this.state;
    menuItem = Object.assign(menuItem, { icon });
    this.setState({ menuItem });
    this.toggleIconList(false);
  };

  addLink = link => {
    let { menuItem } = this.state;
    menuItem = Object.assign(menuItem, { url: `/${link}#id=` });
    this.setState({ menuItem });
  };

  updateState = (key, e) => {
    let { menuItem } = this.state;
    let { value } = e.target;
    menuItem = Object.assign(menuItem, {
      [key]: value,
      pinyin: util.toPinYin(value).toLowerCase(),
      pinyin_full: util.toPinYinFull(value).toLowerCase()
    });
    this.setState({ menuItem });
  };

  render() {
    let { menuItem, editMode, iconVisible } = this.state;
    let urlIcon = menuItem.icon === "" ? "图标" : <Icon type={menuItem.icon} />;
    return (
      <Modal
        title={editMode ? "编辑菜单项" : "新增菜单项"}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText="确认"
        cancelText="取消"
      >
        <IconList
          visible={iconVisible}
          onCancel={this.toggleIconList}
          onOk={this.updateIcon}
        />
        <div className={styles.title}>
          <Button onClick={this.chooseIcon}>{urlIcon}</Button>
          <Input
            placeholder="标题"
            value={menuItem.title}
            onChange={e => this.updateState("title", e)}
          />
        </div>
        <Input
          className={styles.input}
          placeholder="链接地址"
          value={menuItem.url}
          onChange={e => this.updateState("url", e)}
        />
        <div className={styles.tags}>
          <Tag color="#f50" onClick={() => this.addLink("chart")}>
            图表
          </Tag>
          <Tag color="#108ee9" onClick={() => this.addLink("table")}>
            报表
          </Tag>
        </div>
      </Modal>
    );
  }
}

MenuItem.defaultProps = {
  visible: false,
  menuItem: {
    title: "",
    url: "",
    icon: ""
  },
  editMode: false,
  iconVisible: false
};

export default MenuItem;
