import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Input, Popconfirm, notification } from 'antd';

import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

import * as treeUtil from './tree-data-utils';
import * as db from '../service';
import styles from '../index.less';

import { TMenuList } from './MenuItemList';
import { TMenuItem } from './MenuItem';

import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const R = require('ramda');

interface IPreviewState {
  expanded: boolean;
  treeData: TMenuList;
  shouldCopyOnOutsideDrop: boolean;
  externalNodeType: string;
  editMode: boolean;
  menu_id: string | number;
  uid?: string | number;
  title: string;
}

interface IPreviewProps {
  externalNodeType: string;
  menuDetail: TMenuItem;
  editMode: boolean;
  treeData: TMenuList;
  uid?: string | number;
  onNew?: () => void;
  menuList?: any;
  [key: string]: any;
}

// 左侧菜单项更新时，菜单列表中对应信息一并更新
const updateMenuItem = (detail, menuList) => {
  return detail.map(item => {
    if (item.children) {
      item.children = updateMenuItem(item.children, menuList);
    } else {
      let newItem = R.find(R.propEq('id', item.id))(menuList);
      if (!R.isNil(newItem)) {
        item = Object.assign(item, newItem);
      }
    }
    return item;
  });
};

@connect(state => ({
  menuList: state.menu.treeDataLeft,
}))
class MenuPreview extends Component<IPreviewProps, IPreviewState> {
  static defaultProps: Partial<IPreviewProps> = {
    externalNodeType: 'shareNodeType',
    menuDetail: {
      id: 0,
      detail: [],
      title: '',
      icon: '',
      url: '',
    },
    editMode: false,
    treeData: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      treeData: [],
      shouldCopyOnOutsideDrop: false,
      externalNodeType: props.externalNodeType,
      editMode: props.editMode,
      menu_id: 0,
      uid: props.uid,
      title: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let { id: menu_id, detail, title } = nextProps.menuDetail;
    if (R.isNil(menu_id) || R.equals(menu_id, prevState.menu_id)) {
      return null;
    }
    let treeData = updateMenuItem(detail, nextProps.menuList);
    return {
      treeData,
      menu_id,
      title,
      editMode: nextProps.editMode,
    };
  }

  // 菜单层级调整
  onTreeChange = treeData => {
    this.setState({ treeData });
    // console.log('菜单项调整：', treeData);
  };

  // 展开所有
  expandAll = () => {
    let {
      expanded,
      treeData,
    }: {
      expanded: boolean;
      treeData: TMenuList;
    } = this.state;
    treeData = treeUtil.toggleExpandedForAll({ expanded, treeData });
    this.setState({ treeData, expanded: !expanded });
  };

  // 移除菜单项
  removeMenuItem = async ({ path }) => {
    let {
      treeData,
    }: {
      treeData: TMenuList;
    } = R.clone(this.state);
    treeData = treeUtil.removeNodeAtPath({
      treeData,
      path,
      getNodeKey: treeUtil.getNodeKey,
    });

    this.setState({ treeData });
  };

  noticeError = () => {
    // 数据插入失败
    notification.error({
      message: '系统提示',
      description: '菜单配置信息调整失败，请稍后重试.',
    });
  };

  submitMenu = async () => {
    let { treeData: detail, title, uid, editMode, menu_id } = this.state;
    let params: {
      title: string;
      uid: string | number;
      detail: any;
    } = {
      title,
      detail: JSON.stringify(detail),
      uid,
    };

    if (!editMode) {
      let { data } = await db.addBaseMenuList(params).catch(e => {
        return [{ affected_rows: 0 }];
      });
      if (data[0].affected_rows === 0) {
        this.noticeError();
        return;
      }

      // 清理菜单缓存
      await db.clearMenu();

      this.setState({
        editMode: true,
        menu_id: data[0].id,
      });
    } else {
      let updateParam = R.clone(params);
      updateParam._id = menu_id;
      let { data } = await db.setBaseMenuList(updateParam).catch(e => {
        return [{ affected_rows: 0 }];
      });
      if (data[0].affected_rows === 0) {
        this.noticeError();
        return;
      }
    }

    this.props.onNew();

    notification.success({
      message: '系统提示',
      description: '菜单项调整成功.',
    });
    this.props.dispatch({
      type: 'menu/refreshMenuList',
    });
    // window.location.reload();
  };

  render(): JSX.Element {
    const {
      externalNodeType,
      shouldCopyOnOutsideDrop,
      treeData,
      expanded,
      editMode,
      title,
    } = this.state;
    return (
      <>
        <p className={styles.title}>2.菜单编辑</p>
        <div className={styles.action} style={{ paddingLeft: 0 }}>
          <span style={{ width: 100 }}>菜单标题：</span>
          <Input
            prefix={<EditOutlined />}
            placeholder="菜单名称"
            value={title}
            onChange={e => this.setState({ title: e.target.value })}
          />
        </div>

        <div className={cx('action', 'action-submit')} style={{ paddingLeft: 0 }}>
          <Button onClick={this.expandAll}>{expanded ? '全部展开' : '全部折叠'}</Button>
          <Button onClick={this.props.onNew} icon={<FileOutlined />}>
            新建
          </Button>
          <Button
            type="primary"
            onClick={this.submitMenu}
            disabled={R.isNil(treeData) || treeData.length === 0}
          >
            {editMode ? '更新' : '新增'}
          </Button>
        </div>

        <div style={{ height: 500 }} className={styles.container}>
          <SortableTree
            treeData={treeData}
            onChange={this.onTreeChange}
            rowHeight={45}
            dndType={externalNodeType}
            shouldCopyOnOutsideDrop={shouldCopyOnOutsideDrop}
            generateNodeProps={treeItem => ({
              buttons: [
                <Popconfirm
                  title="确定删除该菜单项?"
                  okText="是"
                  cancelText="否"
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={() => this.removeMenuItem(treeItem)}
                >
                  <Button size="small" icon={<DeleteOutlined />} />
                </Popconfirm>,
              ],
            })}
          />
        </div>
      </>
    );
  }
}
export default MenuPreview;
