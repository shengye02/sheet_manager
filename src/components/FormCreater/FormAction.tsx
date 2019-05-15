import React, { useState, useEffect } from 'react';
import {
  Col,
  Button,
  Popconfirm,
  notification
} from 'antd';
import { validRequire, getPostData } from './lib';
import { axios } from '@/utils/axios';
import * as R from 'ramda';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { connect } from 'dva';

function formAction({ fields, requiredFileds, uid, setEditMethod, formstatus, editMethod, state, setState, formConfig, config }) {
  // 当前数据提交状态，提交时禁止重复提交
  const [submitting, setSubmitting] = useState(false);

  const formInstance = {
    set(data) {
      // 设置表单初始数据
      setState(data);
    },
    get() {
      // 获取初始数据
      return {
        ...fields,
        ...state,
      };
    },
    reset() {
      setState(fields);
    },
  };

  let [loadOption, setLoadOption] = useState({ url: null, params: {} });

  useEffect(() => {
    if (!loadOption.url) {
      return;
    }

    axios(loadOption).then(({ data }) => {
      if (data.length === 0) {
        return;
      }
      // 载入历史数据
      // setState(data[0]);
      formInstance.set(data[0]);
      setEditMethod('update');
    });
  }, [loadOption.params]);

  const onReset = () => {
    formInstance.reset();
    // 重置编辑状态
    setEditMethod('insert');
  };

  useEffect(() => {
    // 历史数据载入 
    let { api } = formConfig;
    if (api && api.query) {
      // api不存在，历史记录查询接口不存在，当前为更新模式
      loadHistoryData(api.query);
    }
  }, [state]);

  // 索引字段(通过校验后)改变时，如车号等，载入初始数据用于更新
  const loadHistoryData = async ({ param, url }) => {
    if (!param) {
      return;
    }
    // 如果不存在 query或没有param时（无查询主键）返回
    let params = R.pick(param)(state);
    if (Object.keys(params).length !== param.length) {
      // 观测参数未设置完全
      return;
    }

    // 查询参数不变更时禁止提交查询
    if (R.equals(params, loadOption.params)) {
      return;
    }

    let option = {
      url,
      params,
    };
    setLoadOption(option);
  };

  const notity = affected_rows => {
    if (affected_rows == 0) {
      notification.error({
        message: '系统提示',
        description: '提交失败.',
      });
    }
    notification.success({
      message: '系统提示',
      description: '提交成功.',
    });
    onReset();
  };

  // 根据索引字段删除数据，建议用至少一个字段作为索引，推荐用_id(需在查询中一并附带)
  const onDelete = async () => {
    let { api } = config;
    if (!api || !api.delete || !api.delete.param) {
      return;
    }
    let { param, url } = api.delete;
    let params = R.pick(param, state);
    let {
      data: [affected_rows],
    } = await axios({ url, params });
    console.log('删除数据', { url, params });
    notity(affected_rows);
  };


  // 提交数据
  const onsubmit = async (editType = editMethod) => {
    if (submitting) {
      return;
    }
    // 必填数据是否填写
    let status = validRequire(requiredFileds, state);
    if (!status) {
      notification.error({
        message: '系统提示',
        description: '必填字段校验失败',
      });
    }

    let params = formInstance.get();
    let axiosConfig = getPostData({ config, params, editMethod: editType, uid });
    console.log('插入/更新数据', axiosConfig);

    setSubmitting(true);
    let {
      data: [{ affected_rows }],
    } = await axios(axiosConfig);

    setSubmitting(false);
    notity(affected_rows);
  };

  return <Col span={24} className={styles.submit}>
    <Button type="default" onClick={() => onReset()} disabled={!formstatus}>
      {formatMessage({ id: 'form.reset' })}
    </Button>
    {editMethod === 'update' && (
      <Button
        type="danger"
        onClick={() => onsubmit()}
        disabled={!formstatus}
        style={{ marginLeft: 20 }}
        loading={submitting}
      >
        {formatMessage({ id: 'form.update' })}
      </Button>
    )}
    <Button
      type="primary"
      onClick={() => onsubmit('insert')}
      disabled={!formstatus}
      style={{ marginLeft: 20 }}
      loading={submitting}
    >
      {formatMessage({ id: 'form.submit' })}
    </Button>

    {config.api.delete && config.api.delete.url && (
      <Popconfirm
        title="确定删除本条数据?"
        onConfirm={() => onDelete()}
        okText="是"
        cancelText="否"
      >
        <Button
          type="danger"
          disabled={!formstatus}
          style={{ marginLeft: 20 }}
          loading={submitting}
        >
          {formatMessage({ id: 'form.delete' })}
        </Button>
      </Popconfirm>
    )}
  </Col>
}


export default connect(({ common: { userSetting } }) => ({
  uid: userSetting.uid,
}))(formAction);