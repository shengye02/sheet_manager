import util from '../lib'
import * as lib from '../../../../utils/lib';
import jStat from 'jStat';
const R = require("ramda");

let chartConfig = [{
        key: 'type',
        title: '图表类型',
        default: 'paralell',
        url: '/chart#id=15/440962596e&type=paralell&visual=0'
    }, {
        key: 'x',
        title: 'X轴在数据的索引或键值',
        default: 0
    },
    {
        key: 'y',
        title: 'Y轴在数据的索引或键值',
        default: 1
    },
    {
        key: 'legend',
        title: '数据序列的索引或键值',
        default: '不设置时，数据超过2列，legend/x/y默认为0，1，2;如果数据列最多只有2列，则x/y为 0/1。legend只允许选择单项',
    }
];

const heatmap = config => {
    return {
        "tooltip": {
            trigger: 'item',
            "position": "top"
        },
        legend: {
            show: false
        },
        "xAxis": {
            "type": "category",
            "data": ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"],
            "splitArea": {
                "show": true
            }
        },
        "yAxis": {
            "type": "category",
            "data": ["Saturday", "Friday", "Thursday", "Wednesday", "Tuesday", "Monday", "Sunday"],
            "splitArea": {
                "show": true
            }
        },
        "visualMap": {
            "min": 0,
            "max": 10,
            precision: 1,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: -15,
            color: ["#45527a", "#f44"]
        },
        "series": [{
            "name": "Punch Card",
            "type": "heatmap",
            "data": [
                [0, 0, 5],
                [1, 0, 1],
                [2, 0, "-"],
                [3, 0, "-"],
                [4, 0, "-"],
                [5, 0, "-"],
                [6, 0, "-"],
                [7, 0, "-"],
                [8, 0, "-"],
                [9, 0, "-"],
                [10, 0, "-"],
                [11, 0, 2],
                [12, 0, 4],
                [13, 0, 1],
                [14, 0, 1],
                [15, 0, 3],
                [16, 0, 4],
                [17, 0, 6],
                [18, 0, 4],
                [19, 0, 4],
                [20, 0, 3],
                [21, 0, 3],
                [22, 0, 2],
                [23, 0, 5],
                [0, 1, 7],
                [1, 1, "-"],
                [2, 1, "-"],
                [3, 1, "-"],
                [4, 1, "-"],
                [5, 1, "-"],
                [6, 1, "-"],
                [7, 1, "-"],
                [8, 1, "-"],
                [9, 1, "-"],
                [10, 1, 5],
                [11, 1, 2],
                [12, 1, 2],
                [13, 1, 6],
                [14, 1, 9],
                [15, 1, 11],
                [16, 1, 6],
                [17, 1, 7],
                [18, 1, 8],
                [19, 1, 12],
                [20, 1, 5],
                [21, 1, 5],
                [22, 1, 7],
                [23, 1, 2],
                [0, 2, 1],
                [1, 2, 1],
                [2, 2, "-"],
                [3, 2, "-"],
                [4, 2, "-"],
                [5, 2, "-"],
                [6, 2, "-"],
                [7, 2, "-"],
                [8, 2, "-"],
                [9, 2, "-"],
                [10, 2, 3],
                [11, 2, 2],
                [12, 2, 1],
                [13, 2, 9],
                [14, 2, 8],
                [15, 2, 10],
                [16, 2, 6],
                [17, 2, 5],
                [18, 2, 5],
                [19, 2, 5],
                [20, 2, 7],
                [21, 2, 4],
                [22, 2, 2],
                [23, 2, 4],
                [0, 3, 7],
                [1, 3, 3],
                [2, 3, "-"],
                [3, 3, "-"],
                [4, 3, "-"],
                [5, 3, "-"],
                [6, 3, "-"],
                [7, 3, "-"],
                [8, 3, 1],
                [9, 3, "-"],
                [10, 3, 5],
                [11, 3, 4],
                [12, 3, 7],
                [13, 3, 14],
                [14, 3, 13],
                [15, 3, 12],
                [16, 3, 9],
                [17, 3, 5],
                [18, 3, 5],
                [19, 3, 10],
                [20, 3, 6],
                [21, 3, 4],
                [22, 3, 4],
                [23, 3, 1],
                [0, 4, 1],
                [1, 4, 3],
                [2, 4, "-"],
                [3, 4, "-"],
                [4, 4, "-"],
                [5, 4, 1],
                [6, 4, "-"],
                [7, 4, "-"],
                [8, 4, "-"],
                [9, 4, 2],
                [10, 4, 4],
                [11, 4, 4],
                [12, 4, 2],
                [13, 4, 4],
                [14, 4, 4],
                [15, 4, 14],
                [16, 4, 12],
                [17, 4, 1],
                [18, 4, 8],
                [19, 4, 5],
                [20, 4, 3],
                [21, 4, 7],
                [22, 4, 3],
                [23, 4, "-"],
                [0, 5, 2],
                [1, 5, 1],
                [2, 5, "-"],
                [3, 5, 3],
                [4, 5, "-"],
                [5, 5, "-"],
                [6, 5, "-"],
                [7, 5, "-"],
                [8, 5, 2],
                [9, 5, "-"],
                [10, 5, 4],
                [11, 5, 1],
                [12, 5, 5],
                [13, 5, 10],
                [14, 5, 5],
                [15, 5, 7],
                [16, 5, 11],
                [17, 5, 6],
                [18, 5, "-"],
                [19, 5, 5],
                [20, 5, 3],
                [21, 5, 4],
                [22, 5, 2],
                [23, 5, "-"],
                [0, 6, 1],
                [1, 6, "-"],
                [2, 6, "-"],
                [3, 6, "-"],
                [4, 6, "-"],
                [5, 6, "-"],
                [6, 6, "-"],
                [7, 6, "-"],
                [8, 6, "-"],
                [9, 6, "-"],
                [10, 6, 1],
                [11, 6, "-"],
                [12, 6, 2],
                [13, 6, 1],
                [14, 6, 3],
                [15, 6, 4],
                [16, 6, "-"],
                [17, 6, "-"],
                [18, 6, "-"],
                [19, 6, "-"],
                [20, 6, 1],
                [21, 6, 2],
                [22, 6, 2],
                [23, 6, 6]
            ],
            "label": {
                "normal": {
                    "show": true
                }
            },
            "itemStyle": {
                "emphasis": {
                    "shadowBlur": 10,
                    "shadowColor": "rgba(0, 0, 0, 0.5)"
                }
            }
        }]
    }
}

export {
    heatmap,
    chartConfig
}