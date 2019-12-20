import React, { useState, useEffect } from 'react';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import beautify from 'js-beautify';
import 'codemirror/mode/sql/sql';

import { Drawer, Button, notification, Typography, Divider } from 'antd';
import { host } from '@/utils/setting';

const { Title, Paragraph, Text } = Typography;

import styles from './CodeDrawer.less';
import * as R from 'ramda';

/**
 * https://github.com/reduxjs/redux/blob/6b3e1ceb1ddef4915b9b8e148be66c0806f9fd0a/src/utils/actionTypes.ts#L8
 */
const getNonce = () =>
  Math.random()
    .toString(36)
    .slice(3);

/**
// 更新触发器
DROP TRIGGER IF EXISTS `api_nonce`;
delimiter ;;
CREATE TRIGGER `api_nonce` BEFORE INSERT ON `sys_api` FOR EACH ROW if new.nonce='' then 
	set new.nonce = substring(MD5(RAND()*100),1,10); 
end if
;;
delimiter ;
 */

const getCreate = config => {
  let res = R.compose(
    R.flatten,
    R.map(item => item.detail)
  )(config.detail);
  let keyStrs = res.map(item => {
    let key = item.key;
    if (item.type.includes('date')) {
      return `  [${key}] datetime  DEFAULT (getdate()) NULL`;
    } else if (item.type === 'input.number') {
      // 字段类型
      let filedType = 'int';
      if (item.rule && item.rule.type === 'float') {
        filedType = 'float(53)';
      }
      return `  [${key}] ${filedType} DEFAULT ((0)) NULL`;
    }
    return `  [${key}] nchar(40) DEFAULT ''`;
  });

  let param = config.api.insert.param || [];
  let appendSql = '';
  if (param.includes('rec_time')) {
    appendSql += '[rec_time] datetime DEFAULT (getdate()) NULL,';
  }
  if (param.includes('uid')) {
    appendSql += '[uid] int NULL,';
  }

  // 建表SQL
  let createSql = `CREATE TABLE tbl_${config.table} (
  [id] int  IDENTITY(1,1) NOT NULL,
  ${appendSql}
  ${keyStrs.join(',\r\n')}
) ;`;

  let getDescByField = (field, title) => `
EXEC sp_addextendedproperty
'MS_Description', N'${title}',
'SCHEMA', N'dbo',
'TABLE', N'tbl_${config.table}',
'COLUMN', N'${field}';`;

  // 添加注释
  let desc = `
EXEC sp_addextendedproperty
'MS_Description', N'${config.name}',
'SCHEMA', N'dbo',
'TABLE', N'tbl_${config.table}';
${getDescByField('id', '主ID')}`;

  if (param.includes('rec_time')) {
    desc += getDescByField('rec_time', '记录时间');
  }
  if (param.includes['uid']) {
    desc += getDescByField('uid', '用户Uid');
  }
  res.forEach(item => {
    desc += getDescByField(item.key, item.title);
  });

  // 添加注释完毕

  return createSql + desc;
};

const getApi = (config, nonce) => {
  let res = R.compose(
    R.flatten,
    R.map(item => item.detail)
  )(config.detail);
  let keyStrs = res.map(item => item.key);

  let param = {
    insert: config.api.insert.param || [],
    delete: config.api.delete.param || [],
    update: config.api.update.param || [],
    query: config.api.query.param || [],
  };

  let condition = key => ({
    where:
      param[key].length > 0 ? ' where ' + param[key].map(name => ` ${name}=? `).join(' and ') : '',
    param: param[key].join(','),
  });

  let query = `
  -- 数据载入接口
INSERT INTO sys_api ( nonce, db_id, uid, api_name, sqlstr, param,remark )
VALUES
  ( '${nonce}','2','1','${config.name}_载入','select  ${keyStrs.join(',')} from  tbl_${
    config.table
  }  ${condition('query').where}', '${condition('query').param}','' );`;

  let del = `
-- 数据接口删除
INSERT INTO sys_api ( nonce, db_id, uid, api_name, sqlstr, param,remark )
VALUES
  ( '${nonce}','2','1','${config.name}_删除','delete from  tbl_${config.table}  ${
    condition('delete').where
  }','${condition('delete').param}','' );`;

  // 先过滤条件字段
  let editKeys = keyStrs.filter(item => !param.update.includes(item));
  let editStr = editKeys.map(key => `${key}=?`).join(',');
  let paramUpdate = [...editKeys, ...param.update];

  let edit = `
-- 数据更新接口
INSERT INTO sys_api ( nonce,db_id, uid, api_name, sqlstr, param,remark )
VALUES
  ( '${nonce}','2','1','${config.name}_更新','update tbl_${config.table} set ${editStr} ${
    condition('update').where
  }','${paramUpdate.join(',')}','' );`;

  // 先过滤条件字段
  let addKeys = [...keyStrs, ...param.insert];

  let addStr = addKeys.map(key => `?`).join(',');

  let add = `-- 数据增加接口
INSERT INTO sys_api ( nonce,db_id, uid, api_name, sqlstr, param ,remark)
VALUES
  ( '${nonce}','2','1','${config.name}_添加','insert into  tbl_${config.table}(${addKeys.join(
    ','
  )}) values(${addStr})','${addKeys.join(',')}','' );`;

  let review = `
-- 查询最近录入的数据
INSERT INTO sys_api ( nonce,db_id, uid, api_name, sqlstr,remark )
VALUES
  ( '${nonce}','2','1','${config.name} 近期录入信息','SELECT top 10 * FROM view_${config.table} ORDER BY 录入时间 desc','' );`;

  return [add, del, edit, query, review].join('\r\n');
};

const getApiConfig = (api, nonce) => {
  let res = {};
  Object.keys(api).forEach(key => {
    let config = api[key];
    config.url = config.url.split('/')[0] + '/' + nonce;
    res[key] = config;
  });
  return res;
};

export default function codeDrawer({
  modalVisible,
  setModalVisible,
  formConfig,
  setFormConfig,
}): JSX.Element {
  const [beautyConfig, setBeautyConfig] = useState('{}');

  const [sql, setSql] = useState({});

  useEffect(() => {
    const beautyOption = {
      indent_size: 2,
      wrap_line_length: 80,
      jslint_happy: true,
    };
    const code: string = beautify(JSON.stringify(formConfig), beautyOption);
    setBeautyConfig(code);
    if (formConfig.detail) {
      let res = R.compose(
        R.flatten,
        R.map(item => item.detail)
      )(formConfig.detail);
      let keys = res.map(item => item.key);

      let condition = formConfig.api.query || {
        param: ['_id'],
      };
      const select = `      SELECT 
        ${keys.join(',\r\n        ')} 
      FROM
        tbl_${formConfig.table} 
      WHERE
        ${condition.param.map(item => `${item} = '1'`).join(' and ')}`;

      const create = getCreate(formConfig);
      let query = `SELECT top 10 * FROM view_${formConfig.table} ORDER BY 录入时间 desc;`;

      let nonce = getNonce();
      const api = getApi(formConfig, nonce);

      setSql({
        select,
        create,
        api,
        json: beautify(JSON.stringify(getApiConfig(R.clone(formConfig.api), nonce)), beautyOption),
        view: `
      CREATE VIEW  view_${formConfig.table} AS
        SELECT id,
        ${res
          .map(item => {
            let keyName = item.key;
            if (item.type.includes('date')) {
              keyName =
                item.datetype === 'YYYY-MM-DD hh:mm:ss'
                  ? `CONVERT ( VARCHAR, ${item.key}, 120 )`
                  : `CONVERT ( VARCHAR(10), ${item.key}, 120 )`;
            }
            return `${keyName} ${item.title}`;
          })
          .join(',\r\n        ')},
	    CONVERT ( VARCHAR, rec_time, 120 ) 录入时间
        FROM
        tbl_${formConfig.table};
        EXEC sp_addextendedproperty
        'MS_Description', N'${formConfig.name}',
        'SCHEMA', N'dbo',
        'VIEW', N'view_${formConfig.table}';`,
        query,
      });
    }
  }, [formConfig]);

  const handleConfig = () => {
    try {
      let configStr: {} = JSON.parse(beautyConfig);
      setFormConfig(configStr);
    } catch (e) {
      notification.error({
        message: '系统提示',
        description: '格式异常，不是有效的JSON数据，请仔细检查',
      });
    }
  };

  return (
    <Drawer
      placement="right"
      closable={false}
      visible={modalVisible}
      width="550px"
      onClose={() => setModalVisible(false)}
      bodyStyle={{ padding: 20 }}
    >
      <Paragraph>
        <Title level={3}>表单配置项</Title>
      </Paragraph>
      <div>
        <p>自定义报表时，可参考该配置</p>
        <p>
          1.在insert接口设置的param字段，如果设置rec_time,uid，系统自动将当前用户uid以及rec_time作为提交字段向后台提交。
        </p>
        <p>2.span代表当前录入项宽度，建议值24(100%)、12(50%)、8(33%)</p>
      </div>
      <Divider />
      <Paragraph>
        <Title level={4}>配置文件</Title>
      </Paragraph>
      <CodeMirror
        value={beautyConfig}
        options={{
          mode: 'javascript',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
        onBeforeChange={(editor, data, value) => {
          setBeautyConfig(value);
        }}
        className={styles.code}
      />

      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={handleConfig}>
          实时预览
        </Button>
      </div>

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>1.建表</Title>
        此处以<Text mark>MSSQL Server</Text>
        为例建立数据表，需要处理数据字段类型识别、字段注释、表单注释相关功能；同时建立数据视图
        <Text mark>view_{formConfig.table}</Text>
        ，建完视图后用于业务查询。
      </Paragraph>
      <CodeMirror
        value={sql.create + sql.view}
        options={{
          mode: 'sql',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>2.接口配置</Title>
        请到
        <Text mark>
          <a
            href={`${host.replace('api', 'public')}index.html`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {host.replace('api', 'public')}index.html
          </a>
        </Text>
        添加接口的增、删、改。
      </Paragraph>
      <CodeMirror
        value={sql.select}
        options={{
          mode: 'sql',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />

      <Paragraph style={{ marginTop: 10 }}>
        在有大量表单需要处理时，建议通过以下方式手动<Text mark>在接口管理数据库中批量添加</Text>
        ,其中db_id表示业务数据库id,uid表示接口管理用户id，可根据情况手动修改：
      </Paragraph>
      <CodeMirror
        value={sql.api}
        options={{
          mode: 'sql',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />

      <Paragraph style={{ marginTop: 10 }}>
        同时将json配置中的api部分改为以下形式，其中nonce已经更新:
      </Paragraph>
      <CodeMirror
        value={sql.json}
        options={{
          mode: 'javascript',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>3.业务报表</Title>
        <Text>下列语句用于查看最近录入的10条数据：</Text>
      </Paragraph>
      <CodeMirror
        value={sql.query}
        options={{
          mode: 'sql',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />
      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>4.辅助功能-默认选择项</Title>
        <Text>参考以下语句分割excel中单列选项数据：</Text>
      </Paragraph>

      <CodeMirror
        value={`       JSON.stringify(
        \`JB2 正棕
        JB2 正桔红 
        \`.split('\\n')
      .filter(item=>item.trim().length)
      .map((name)=>({name:name.trim(),value:name.trim(),hide: ["anti_fake", "drying_time", "release_time"],"scope": [
        {
          "key": "anti_fake",
          "max": 15,
          "suffix": "%",
          "block": "有红外吸收，近红外反射值≤15%"
        }
      ]})))`}
        options={{
          mode: 'javascript',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />
    </Drawer>
  );
}
