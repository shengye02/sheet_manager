import React, { useState, useEffect } from 'react';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import beautify from 'js-beautify';
import 'codemirror/mode/sql/sql';
import { CopyOutlined } from '@ant-design/icons';

import { Drawer, Button, notification, Typography, Divider, message } from 'antd';
import { host } from '@/utils/setting';

const { Title, Paragraph, Text } = Typography;

import styles from './CodeDrawer.less';
import * as R from 'ramda';
import { getNonce } from '@/utils/lib';
import { getApiConfig, getApi, getCreate, getSysApi } from './lib';

import { CopyToClipboard } from 'react-copy-to-clipboard';

const jsOption = {
  mode: 'javascript',
  lineNumbers: true,
  styleActiveLine: true,
  matchBrackets: true,
  theme: 'material',
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
    if (!formConfig.detail) {
      return;
    }

    let unmounted = false;

    (async () => {
      let res = R.compose(
        // R.reject(R.propEq('key', 'ignoreIncrese')),
        R.reject(item => !item.key || item.key.includes('ignore') || item.ignore),
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
      ${(condition.param || []).map(item => `${item} = '1'`).join(' and ')}`;

      let quick = `      SELECT 
      ${keys.join(',\r\n        ')} 
    FROM
      tbl_${formConfig.table} 
    WHERE uid=1 and id=2`;

      const create = getCreate(formConfig);
      let query = `

-- 下列语句用于查看最近录入的10条数据
SELECT top 50 * FROM view_${formConfig.table} ORDER BY 录入时间 desc;`;

      let nonce = getNonce();
      const api = getApi(formConfig, nonce);
      let jsonCfg = await getApiConfig(R.clone(formConfig), nonce);

      // let { maxid } = await getSysApi().then(res => res.data[0]);

      // console.log(
      //   JSON.stringify({
      //     load: { url: `${maxid}/${nonce}.json`, param: ['_id'] },
      //   })
      //     .replace('{', ',')
      //     .slice(0, -1)
      // );

      if (unmounted) {
        return;
      }

      setSql({
        select,
        create,
        api,
        quick,
        json: beautify(JSON.stringify(jsonCfg), beautyOption),
        view: `
    CREATE VIEW  view_${formConfig.table} AS
      SELECT id,CONVERT ( VARCHAR, rec_time, 120 ) 录入时间,
      ${res
        .map(item => {
          let keyName = item.key;
          if (item.type.includes('date')) {
            keyName =
              item.datetype === 'YYYY-MM-DD hh:mm:ss'
                ? `CONVERT ( VARCHAR, ${item.key}, 112 )`
                : `CONVERT ( VARCHAR(10), ${item.key}, 112 )`;
          }
          if (item.type === 'switch') {
            keyName = `(
              CASE ${item.key}
              WHEN '1' THEN
                '${item.checkedChildren || '合格'}'
              WHEN 'true' THEN
                '${item.checkedChildren || '合格'}'
              ELSE 
              '${item.unCheckedChildren || '不合格'}'
              END
            ) `;
          }
          return `${keyName} ${item.title}`;
        })
        .join(',\r\n        ')} , uid 
      FROM
      tbl_${formConfig.table};
      EXEC sp_addextendedproperty
      'MS_Description', N'${formConfig.name}',
      'SCHEMA', N'dbo',
      'VIEW', N'view_${formConfig.table}';`,
        query,
      });
    })();

    return () => {
      unmounted = true;
    };
  }, [JSON.stringify(formConfig)]);

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
        options={jsOption}
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

      <CopyToClipboard
        text={sql.create + sql.view}
        onCopy={() => message.success('拷贝成功，请到api管理平台建立接口')}
      >
        <Button style={{ marginTop: 10 }} icon={<CopyOutlined />}>
          点击复制
        </Button>
      </CopyToClipboard>

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>2.接口配置（批量添加）</Title>
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

      <CopyToClipboard
        text={sql.api}
        onCopy={() => message.success('拷贝成功，请到数据库管理工具中初始化配置信息')}
      >
        <Button style={{ marginTop: 10 }} icon={<CopyOutlined />}>
          点击复制
        </Button>
      </CopyToClipboard>

      <Paragraph style={{ marginTop: 10 }}>
        同时将json配置改为以下形式，其中api部分对应的接口id以及nonce信息已经更新:
      </Paragraph>
      <CodeMirror value={sql.json} options={jsOption} />

      <CopyToClipboard
        text={sql.json}
        onCopy={() => message.success('拷贝成功，请替换当前json文件')}
      >
        <Button style={{ marginTop: 10 }} icon={<CopyOutlined />}>
          点击复制
        </Button>
      </CopyToClipboard>

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>3.接口配置（手工建接口）</Title>
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
        value={sql.quick}
        options={{
          mode: 'sql',
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          theme: 'material',
        }}
      />
      <CopyToClipboard
        text={sql.quick}
        onCopy={() => message.success('拷贝成功，请到数据库管理工具中初始化配置信息')}
      >
        <Button style={{ marginTop: 10 }} icon={<CopyOutlined />}>
          点击复制
        </Button>
      </CopyToClipboard>

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>4.辅助功能-默认选择项</Title>
        <Text>
          部分表单中需要select选择框填写大量可选字段，可参考以下语句分割excel中单列选项数据：
        </Text>
      </Paragraph>

      <CodeMirror
        value={`
        // 将以下文字粘贴至调试控制台

        let str = JSON.stringify(
        \`JB2 正棕
        JB2 正桔红 
        \`.split('\\n')
      .filter(item=>item.trim().length)
      .map((name)=>({name:name.trim(),value:name.trim(),hide: ["anti_fake", "drying_time", "release_time"],"scope": [
        {
          "key": "anti_fake",
          "max": 15,
          "suffix": "%",
          "block": "有红外吸收"
        }
      ]})));
     console.log(\` {
       "title":"某值",
       "key":"key",
      "type": "select",
      "defaultOption":\$\{str\},
      "rule": { 
        "required": true
      }
    }\`);
      
      `}
        options={jsOption}
      />

      <Paragraph style={{ marginTop: 10 }}>
        <Title level={4}>5.数据复杂校验-calc字段</Title>
        <Text>
          如果在校验规则rule中配置类似了calc字段，则表明字段间存在联动的需求。如以下配置为例，小计令数等于令数1至9相加，系统会自动据此等式做校验：
        </Text>

        <CodeMirror
          value={`{
          "title": "令数1",
          "type": "input",
          "key": "ream_num1",
          "rule": {
            "type": "int",  // 表示字段类型为int整型
            "calc": "小计令数=令数1+令数2+令数3+令数4+令数5+令数6+令数7+令数8+令数9", 
            // calc 表示数据联动校验规则，如果校验不通过将红色显示，此时不可提交数据
            "required": true, // 表示数据必填
            "msg": "小计令数与记录详情校验失败，两者和不相等" //表示校验失败时系统的提示信息
          }, 
        }
      `}
          options={jsOption}
        />
      </Paragraph>
      <p>
        在以上例子中，小计令数作为汇总字段，其值为其余相加，此时将令数1设为必填，将calc信息挂载到令数1中触发校验规则，校验不通过时显示对应的msg信息
      </p>
      <Text>
        在数据联动的校验中还支持以下方式的更复杂校验规则(更多信息可以看
        <a href="https://mathjs.org/docs/getting_started.html" target="_blank">
          https://mathjs.org/docs/getting_started.html
        </a>
        )：
      </Text>

      <CodeMirror
        value={`// sin 与 平方
         calc = sin(45 deg) ^ 2 // 返回0.5
         // 开方
         calc = sqrt(9) // 返回 3

         // 平方
         calc = 3 ^ 2 // 返回 9

         // 带括号的四则运算
         calc = (3+2)*4/(6-1) // 返回4

         // 取余
         calc = 6*3%10 // 返回8

         // js语法
         calc = "0820015A".substr(2,1) // 返回 2

         // 通过将以上方式的组合可以满足大部分场景的需要，如:

         {
           rule:{
             required: true
             calc: 某字段 = (字段1+字段2)*2/(字段3+字段4)
           }
         }

      `}
        options={jsOption}
      />
    </Drawer>
  );
}
