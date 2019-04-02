export default {
  name: '业务名称',
  insert: {
    url: '122/adsf78234.json',
    callback(params) {
      return Object.assign(params, {
        uid: 12,
      });
    },
  },
  update: '123/asdfasdf.json',
  delete: '112/a1234asdf.json',
  query: '114/ad3adsf4d.json',
  uniqKey: ['cart_number'],
  detail: [
    {
      title: '基础数据',
      detail: [
        {
          title: '车号',
          type: 'input',
          key: 'cart_number',
          regExp: 'cart', // 'cart'|'reel'|'gz'| RegExp
          placeholder: '请输入8位车号信息',
          maxLength: 8,
          callback(val) {
            return val.trim().toUpperCase();
          },
        },
        {
          title: '部门',
          type: 'select',
          url: '77/51bbce6074.json',
          key: 'dept_id',
        },
        {
          title: '数量1',
          type: 'input',
          key: 'fake_num',
          regExp: /\d+|\d+.\d+/,
          min: 0,
          max: 1000,
          placeholder: '某指标数量',
        },
        {
          title: '录入日期',
          type: 'datepicker',
          key: 'rec_date',
          datetype: 'YYYY-MM-DD',
        },
      ],
    },
    {
      title: '其它数据',
      detail: [
        {
          title: '指标1',
          type: 'input.number',
          key: 'param1',
          min: 0,
          max: 1000,
          block: '(单位：小张)',
          placeholder: '某指标1数量',
        },
        {
          title: '指标2',
          type: 'input',
          key: 'param2',
          regExp: /\d+|(-)\d+.\d+/,
          block: '(单位：大张)',
          placeholder: '某指标2数量',
        },
        {
          title: '备注',
          type: 'input.textarea',
          key: 'remark',
          regExp: /\d+|(-)\d+.\d+/,
          placeholder: '请在此填入备注信息',
        },
      ],
    },
  ],
};
