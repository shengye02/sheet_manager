import pathToRegexp from 'path-to-regexp';
import * as db from '../services/table';
import { setStore, handleTextVal } from '@/utils/lib';
import * as R from 'ramda';
import { isDisabled } from '@/components/QueryCondition';

const namespace = 'table';

const getExtraParam = param => {
  let url = param.params.extra;
  Reflect.deleteProperty(param.params, 'menufold');
  Reflect.deleteProperty(param.params, 'extra');
  return { ...param, url };
};

export default {
  namespace,
  state: {
    dataSource: [],
    axiosOptions: [],
    extraData: [],
    err: false,
    isAntd: false,
  },
  reducers: {
    setStore,
    initState() {
      let isAntd = (window.location.hash || '').includes('theme=antd');
      return { dataSource: [], axiosOptions: [], extraData: [], isAntd };
    },
  },
  effects: {
    *updateParams(_, { put, call, select }) {
      let {
        dateRange,
        tid,
        query,
        selectValue,
        textAreaValue,
        textAreaList,
        dateType: [dateType],
      } = yield select(state => state.common);

      if (R.isNil(tid)) {
        return;
      }
      let axiosOptions = yield call(db.handleParams, {
        params: query,
        tid,
        dateRange,
        dateType,
        textAreaList,
      });

      let inputValue = handleTextVal(textAreaValue);

      axiosOptions = axiosOptions.map(item => {
        let isPost = item.method === 'post';
        item.params = { ...item.params, ...selectValue, ...inputValue };

        [
          'select',
          'selectkey',
          'cascade',
          'textarea',
          'textareakey',
          'merge',
          'mergetext',
          'mergev',
          'link',
          'host', //图片host
        ].forEach(key => {
          Reflect.deleteProperty(isPost ? item.data : item.params, key);
        });

        let { params, data, method, url } = item;
        if (isPost) {
          data = Object.assign(data, params);
          return { data, method, url };
        }
        return item;
      });

      yield put({
        type: 'setStore',
        payload: {
          axiosOptions,
        },
      });
    },
    *refreshData(_, { call, put, select }) {
      const { tid, query, ...common } = yield select(state => state.common);
      // 参数是否全部设置
      const disabled = isDisabled({ ...common, select: query.select });
      if (disabled) {
        return;
      }

      yield put({
        type: 'common/setStore',
        payload: {
          spinning: true,
        },
      });

      let { axiosOptions, dataSource, extraData = [] } = yield select(state => state[namespace]);
      let curPageName = '';

      for (let idx = 0; idx < axiosOptions.length; idx++) {
        let param = axiosOptions[idx];

        let { data, method } = param;

        dataSource[idx] = yield call(db.fetchData, param);

        // 将apiid绑定在接口上，方便对数据设置存储
        dataSource[idx].api_id = method === 'get' ? param.url : `${data.id}/${data.nonce}`;
        curPageName = dataSource[idx].title || '';

        // 处理报表头额外的数据
        if (param.params && param.params.extra) {
          let extraParam = getExtraParam(param);
          extraData[idx] = yield call(db.fetchData, extraParam);
        }
      }

      yield put({
        type: 'common/setStore',
        payload: {
          curPageName,
          spinning: false,
        },
      });

      yield put({
        type: 'setStore',
        payload: {
          dataSource,
          extraData,
        },
      });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(async ({ pathname }) => {
        const match = pathToRegexp('/' + namespace).exec(pathname);
        if (!match) {
          return;
        }

        // 初始化数据
        await dispatch({
          type: 'initState',
        });
      });
    },
  },
};
