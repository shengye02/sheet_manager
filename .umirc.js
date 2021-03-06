// https://umijs.org/config/

import pageRoutes from './config/router.config';

export default {
  extraBabelPlugins: [
    [
      'react-css-modules',
      {
        exclude: 'node_modules',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
        filetypes: {
          '.less': {
            syntax: 'postcss-less',
          },
        },
      },
    ],
  ],
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: {
          hmr: true,
        },
        antd: true, // antd 默认不开启，如有使用需自行配置
        locale: {
          // default false
          enable: true,
          // default zh-CN
          default: 'zh-CN',
          // default true, when it is true, will use `navigator.language` overwrite default
          baseNavigator: true,
        },
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/PageLoading/LoadingDefault.jsx', // Loading2
        },
        // pwa: true,
        fastClick: true,
        targets: {
          ie: 9,
          chrome: 47,
          firefox: 43,
          safari: 9,
          edge: 11,
          ios: 9,
        },
      },
    ],
  ],
  define: {
    APP_TYPE: process.env.APP_TYPE || '',
    BUILD_TYPE: process.env.BUILD_TYPE || 'full',
  },
  // 主目录
  // base: '/sheet/',
  // publicPath: 'http://localhost:70/sheet/',
  hash: true, //添加hash后缀
  treeShaking: true,
  // exportStatic: {
  // htmlSuffix: true, // 静态化文件
  // },
  // exportStatic: false,
  targets: {
    ie: 11,
    chrome: 49,
    firefox: 45,
    safari: 10,
    edge: 13,
    ios: 10,
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': '#1DA57A',
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  // manifest: {
  //   name: 'sheet_manager',
  //   background_color: '#FFF',
  //   description: '基于react的通用报表管理解决方案.',
  //   display: 'standalone',
  //   start_url: '/index.html',
  // },
  cssnano: {
    mergeRules: false,
  },
  autoprefixer: { flexbox: true },
};
