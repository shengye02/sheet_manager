export default [
  // 登录
  {
    path: '/login',
    component: '../layouts/UserLayout',
    routes: [
      {
        path: '/login',
        component: './login'
      },
      {
        path: '/login/register',
        component: './login/register'
      },
      {
        path: '/login/forget',
        component: './login/forget'
      }
    ]
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
      {
        path: '/403',
        component: './403'
      },
      {
        path: '/404',
        component: './404'
      },
      {
        path: '/500',
        component: './500'
      },
      {
        path: '/',
        redirect: '/menu'
      },
      {
        path: '/menu',
        component: './menu'
      },
      {
        path: '/chart',
        component: './chart'
      },
      {
        path: '/table',
        component: './table'
      },
      {
        name: 'account',
        icon: 'user',
        path: '/account',
        routes: [
          {
            path: '/account/settings',
            name: 'settings',
            component: './Account/Settings/Info',
            routes: [
              {
                path: '/account/settings',
                redirect: '/account/settings/base'
              },
              {
                path: '/account/settings/base',
                component: './Account/Settings/BaseView'
              },
              {
                path: '/account/settings/security',
                component: './Account/Settings/SecurityView'
              },
              {
                path: '/account/settings/active',
                component: './Account/Settings/ActiveView'
              }
            ]
          }
        ]
      }
    ]
  }
];
