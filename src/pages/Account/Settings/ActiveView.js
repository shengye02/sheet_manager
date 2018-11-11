import React, { Component, Fragment } from 'react';
import { List } from 'antd';
import * as db from '@/pages/login/service';
import ActiveAction from './ActiveAction';
const R = require('ramda');

class ActiveView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      userTypes: []
    };
  }

  loadUsers = async () => {
    let { data } = await db.getSysUserUnActived();
    this.setState({
      users: data.map(({ _id, fullname: title, dept_name: description }) => ({
        _id,
        title,
        description
      }))
    });
  };

  loadUserTypes = async () => {
    let { data } = await db.getSysUserTypes();

    // 管理员权限需单独审核开通
    this.setState({
      userTypes: data.filter(({ id }) => id > 1)
    });
  };

  componentDidMount() {
    this.loadUsers();
    this.loadUserTypes();
  }

  onChange = (checked, _id) => {
    console.log(`${_id} switch to ${checked}`);
  };

  // 用户激活后从列表移除
  onActived = uid => {
    let { users } = this.state;
    users = R.reject(R.propEq('_id', uid))(users);
    this.setState({ users });
  };

  getData = () => {
    let { users, userTypes } = this.state;
    return users.map(item =>
      Object.assign(item, {
        actions: [
          <ActiveAction
            uid={item._id}
            userTypes={userTypes}
            onChange={this.onActived}
          />
        ]
      })
    );
  };

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default ActiveView;