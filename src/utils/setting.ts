export let DEV: boolean = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// 前台资源部署域名，默认头像图片资源调用域名
let config = {
  chengdu: {
    api: 'http://10.8.1.25',
    footer: '成都印钞有限公司 印钞管理部',
    systemName: '质量信息管理平台',
  },
  kunshan: {
    api: 'http://10.56.37.153',
    footer: '昆山钞票纸业有限公司 企划信息部',
    systemName: '通用报表管理系统',
  },
};

export const CUR_COMPANY = 'kunshan';

export let { systemName } = config[CUR_COMPANY];
export let AUTHOR = config[CUR_COMPANY].footer;

let domain: string = config[CUR_COMPANY].api;
// 后台api部署域名
let host: string = domain + `:100/api/`;

// 人员信息管理，头像信息上传路径
let uploadHost: string = domain + `:100/public/upload/`;

if (DEV) {
  // 上传代码时取消此处的判断
  domain = '';
  host = 'http://localhost:90/api/';
  uploadHost = '//localhost:90/public/upload/';
}

export { domain, host, uploadHost };

// 车号/轴号搜索url
export const searchUrl: string = domain + '/search#';

// 图片信息搜索 Url
export const imgUrl: string = domain + '/search/image#';

export const lsKeys = {
  border: '_tbl_bordered',
  calSetting: '_tbl_calc_',
};
