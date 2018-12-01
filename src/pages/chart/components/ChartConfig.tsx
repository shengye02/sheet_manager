import React, { Component } from 'react';
import { Card, Select, Switch, Row, Col, Slider, Input } from 'antd';
import styles from './Chart.less';
import { formatMessage } from 'umi/locale';
import { chartTypeList } from '../utils/charts';
import Debounce from 'lodash-decorators/debounce';
import * as lib from '@/utils/lib';

const R = require('ramda');
const { Option } = Select;
type IHeaderItem = {
  name: string | JSX.Element;
  value: string;
};
type IHeader = Array<IHeaderItem | string>;

interface ICommonProps {
  title: string;
  desc?: string;
  onChange: (e) => void;
  header?: IHeader;
  [key: string]: any;
}

interface IFiledProps extends ICommonProps {
  value: string | number;
}

interface ISwitProps extends ICommonProps {
  value: string | number | boolean;
}

interface ISliderProps extends ICommonProps {
  value: number;
  [key: string]: any;
}

interface IInputProps extends ICommonProps {
  value: number | string;
  [key: string]: any;
}

const FieldSelector: (props: IFiledProps) => JSX.Element = ({
  title,
  desc,
  value,
  onChange,
  header,
  style
}) => (
  <Col span={8} xl={6} lg={6} md={8} sm={12} xs={24} style={style}>
    <div className={styles.selector}>
      <div className={styles.title}>{title}</div>
      <Select
        value={value}
        size="small"
        onSelect={(value) => onChange(value)}
        style={{ width: 120 }}>
        {header.map((item: IHeaderItem | string, idx: number) =>
          typeof item === 'object' ? (
            <Option key={String(idx)} value={item.value}>
              {item.name}
            </Option>
          ) : (
            <Option key={String(idx)} value={String(idx)}>
              {item}
            </Option>
          )
        )}
      </Select>
    </div>
    {desc && <p className={styles.desc}>{desc}</p>}
  </Col>
);

const FieldSwitch: (props: ISwitProps) => JSX.Element = ({
  title,
  style,
  value,
  onChange,
  desc
}) => (
  <Col span={8} xl={6} lg={6} md={8} sm={12} xs={24} style={style}>
    <div className={styles.selector}>
      <div className={styles.title}>{title}</div>
      <Switch
        size="small"
        checked={value === '1' || value === true ? true : false}
        onChange={onChange}
      />
    </div>
    <p className={styles.desc}>{desc}</p>
  </Col>
);

const FieldSlider: (props: ISliderProps) => JSX.Element = ({
  title,
  style,
  value,
  onChange,
  desc,
  ...exProps
}) => (
  <Col span={8} xl={6} lg={6} md={8} sm={12} xs={24} style={style}>
    <div className={styles.switch}>
      <div className={styles.title}>{title}</div>
      <Slider defaultValue={value} onChange={onChange} {...exProps} />
    </div>
    <p className={styles.desc}>{desc}</p>
  </Col>
);

const FieldInput: (props: IInputProps) => JSX.Element = ({
  title,
  style,
  value,
  onChange,
  desc,
  ...exProps
}) => (
  <Col span={8} xl={6} lg={6} md={8} sm={12} xs={24} style={style}>
    <div className={styles.switch}>
      <div className={styles.title}>{title}</div>
      <Input size="small" value={value} onChange={onChange} {...exProps} />
    </div>
    <p className={styles.desc}>{desc}</p>
  </Col>
);

interface IConfigProps {
  header: Array<string>;
  params: {
    x?: string;
    y?: string;
    z?: string;
    legend?: string;
    group?: string;
    [key: string]: string;
  };
  onChange?: (key: string, val: string) => void;
  onSwitch?: (key: string, val: boolean | string | number) => void;
}

export interface IConfigState {
  x: string;
  y: string;
  z: string;
  legend: string;
  group: string;
  [key: string]: string;
}

export type TAxisName =
  | 'type'
  | 'x'
  | 'y'
  | 'z'
  | 'legend'
  | 'group'
  | 'visual'
  | 'stack'
  | 'simple'
  | 'smooth'
  | 'area'
  | 'zoom'
  | 'zoomv'
  | 'reverse'
  | 'pareto'
  | 'barshadow'
  | 'pictorial'
  | 'polar'
  | 'percent'
  | 'histogram'
  | 'multilegend'
  | 'border'
  | 'step'
  | 'circleshape';

const coordinateAxis = (type) =>
  ![
    'pie',
    'treemap',
    'calendar',
    'paralell',
    'heatmap',
    'sankey',
    'sunburst'
  ].includes(type);
const chartDesc = {
  x: 'X轴所在数据列',
  y: 'Y轴所在数据列',
  z: 'Z轴所在数据列',
  legend: 'legend序列所在数据列',
  group: '数据分组所在数据列',
  simple: '简洁模式，隐藏标题等信息，只显示最小信息',
  smooth: '是否采用平滑曲线渲染',
  stack: '堆叠曲线图或堆叠柱状图，展示某个序列的汇总信息',
  area: '显示曲面图',
  circleshape: '圆形背景',
  zoom: '横向缩放条',
  zoomv: '纵向缩放条',
  reverse: '交换x/y轴，柱状图将转换为条形图',
  pareto: '帕累托图，展示各指标的重要程度',
  barshadow: '单个柱状信息下生效',
  pictorial: '象形柱图',
  polar: '极坐标系，需配合设置极坐标系下其它设置',
  percent: '百分比模式，自动将数据按维度求百分比，堆叠结果的和为100%',
  histogram: '直方图，显示数据分布情况',
  multilegend: '是否显示多个序列',
  step: '阶梯曲线图，在曲线图模式下生效',
  border: '不设置时,最外层数据是否显示为细线条样式',
  vertical: '是否采用垂直布局',
  scale: '图表矩形长宽比例',
  doughnut: '是否显示为环形图',
  radius: '玫瑰图样式设为radius,与面积曲线图只能生效一项',
  visual: '以第几个数据作为颜色索引序列',
  size: '方格大小'
};

const commonSetting = [
  'type',
  'x',
  'y',
  'z',
  'legend',
  'group',
  'simple',
  'visual',
  'height'
];

const getCommonOptions: (
  key: string,
  state: IConfigState
) => boolean | string | number = (
  key,
  { x, y, z, visual, legend, group, type }
) => {
  let res: boolean | string | number = false;
  switch (key) {
    case 'x':
      res = x && coordinateAxis(type);
      break;
    case 'y':
      res = y && coordinateAxis(type);
      break;
    case 'z':
      res =
        z &&
        ['scatter3d', 'bar3d', 'line3d', 'surface', 'scatter'].includes(type);
      break;
    case 'legend':
      res = ['paralell'].includes(type)
        ? true
        : ['calendar'].includes(type)
        ? false
        : legend;
      break;
    case 'group':
      res = [
        'radar',
        'themeriver',
        'sankey',
        'sunburst',
        'treemap',
        'pie',
        'paralell'
      ].includes(type)
        ? true
        : group;
      break;
    case 'visual':
      res = visual;
      break;
    default:
      break;
  }

  return res;
};

const getSwitchOptions = (type) => {
  let opts =
    coordinateAxis(type) &&
    !['themeriver', 'radar', 'pie', 'paralell', 'heatmap','scatter3d', 'bar3d', 'line3d', 'surface'].includes(type)
      ? 'smooth,stack,area,zoom,zoomv,reverse,pareto,barshadow,pictorial,polar,percent,histogram,step'.split(
          ','
        )
      : ['simple'];
  switch (type) {
    case 'sunburst':
      opts.push('border');
      break;
    case 'sankey':
    case 'paralell':
    case 'calendar':
      opts.push('vertical');
      break;
    case 'themeriver':
      opts = [...opts, ...'x,y'.split(',')];
      break;
    case 'radar':
      opts = [...opts, ...'circleshape,area'.split(',')];
      break;
    case 'pie':
      opts = [...opts, ...'radius,area,doughnut'.split(',')];
      break;
    default:
      break;
  }
  return opts;
};

const getInputOptions = (type) => {
  let opts = [];
  switch (type) {
    case 'treemap':
      opts.push('scale');
      break;
    case 'calendar':
      opts.push('size');
      break;
    default:
      break;
  }
  return opts;
};

export const getParams = (params) =>
  R.pick([
    ...commonSetting,
    ...getSwitchOptions(params.type),
    ...getInputOptions(params.type)
  ])(params);

let getChartConfig = (type) => {
  let chartType = chartTypeList.find((list) =>
    R.flatten(list.map(({ value }) => value)).includes(type)
  );
  return chartType || [];
};

export default class ChartConfig extends Component<IConfigProps, IConfigState> {
  constructor(props) {
    super(props);
    let state: IConfigState = getParams(this.props.params);
    this.state = state;
  }

  changeAxis = this.props.onChange;
  directChange = this.props.onSwitch;

  static getDerivedStateFromProps(props, state) {
    let nextState = getParams(props.params);
    let curState = getParams(state);
    if (R.equals(nextState, curState)) {
      return null;
    }
    return nextState;
  }

  @Debounce(600)
  refreshVal(type: string, e: number | string) {
    this.directChange(type, e);
  }

  render() {
    let { type, height } = this.state;
    let { header } = this.props;

    let sOptions = getSwitchOptions(type);
    let inputOptions = getInputOptions(type);
    let commonOptions = ['x', 'y', 'z', 'legend', 'group', 'visual'];

    // 处理图表类型
    let chartType = getChartConfig(type);
    chartType = chartType.map(({ name, value, icon }) => {
      return {
        name: icon ? (
          <div>
            <img src={icon} style={{ width: 24, height: 24, marginRight: 5 }} />
            {name}
          </div>
        ) : (
          name
        ),
        value
      };
    });

    return (
      <Card className={styles.chartConfig} title="图表基础设置" bordered>
        <Row gutter={16} style={{ marginTop: 10 }}>
          {chartType.length > 1 && (
            <FieldSelector
              title={formatMessage({ id: 'chart.config.type' })}
              value={type}
              onChange={(value) => this.changeAxis('type', value)}
              header={chartType}
              style={{ width: '100%' }}
            />
          )}
          {commonOptions.map(
            (key) =>
              getCommonOptions(key, this.state) && (
                <FieldSelector
                  key={key}
                  title={formatMessage({ id: `chart.config.${key}` })}
                  desc={chartDesc[key]}
                  value={this.state[key]}
                  onChange={(value) => this.changeAxis(key, value)}
                  header={header}
                />
              )
          )}
          {sOptions.map((key) => (
            <FieldSwitch
              key={key}
              title={formatMessage({ id: `chart.config.${key}` })}
              desc={chartDesc[key]}
              value={this.state[key]}
              onChange={(value) => this.directChange(key, value)}
            />
          ))}
          {inputOptions.map((key) => (
            <FieldInput
              key={key}
              title={formatMessage({ id: `chart.config.${key}` })}
              desc={chartDesc[key]}
              value={this.state[key]}
              onChange={(e) => {
                e.persist();
                this.directChange(key, e.target.value);
              }}
            />
          ))}
          {height && (
            <FieldSlider
              title={'图表高度'}
              desc={height + 'px'}
              value={parseInt(height)}
              onChange={(value) => this.refreshVal('height', value)}
              max={1500}
              min={300}
              step={10}
            />
          )}
        </Row>
      </Card>
    );
  }
}
