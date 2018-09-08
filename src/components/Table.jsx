import React, { Component } from "react";
import {
  Table,
  Pagination,
  Card,
  Button,
  Input,
  Menu,
  Dropdown,
  Icon
} from "antd";
import * as db from "../services/table";
import styles from "./Table.less";
import * as setting from "../utils/setting";
import Excel from "../utils/excel";
import pdf from "../utils/pdf";

const R = require("ramda");

const Search = Input.Search;

class Tables extends Component {
  constructor(props) {
    super(props);
    this.state = db.initState(props);
  }

  // 返回的值即是当前需要setState的内容
  static getDerivedStateFromProps(props, { page, pageSize, dataSrc, columns }) {
    if (R.equals(props.dataSrc, dataSrc)) {
      return { loading: props.loading };
    }
    return db.updateState(props, { page, pageSize, columns });
  }

  // 页码更新
  refreshByPage = (page = 1) => {
    const { pageSize, dataSource, dataClone } = this.state;
    const dataSourceNew = db.getPageData({
      data: dataClone,
      page,
      pageSize
    });

    if (R.equals(dataSourceNew, dataSource)) {
      return;
    }
    this.setState({
      dataSource: dataSourceNew,
      page
    });
  };

  // 分页数量调整
  onShowSizeChange = async (current, nextPageSize) => {
    let newPage = Math.max(
      Math.floor((this.state.pageSize * current) / nextPageSize),
      1
    );
    await this.setState({
      pageSize: nextPageSize
    });
    this.refreshByPage(newPage);
  };

  customFilter = async filteredInfo => {
    // const dataSrc = this.dataSrc;
    const { columns, dataSrc } = this.state;

    let dataClone = db.handleFilter({
      data: dataSrc.data,
      filters: filteredInfo
    });

    let newColumn = db.updateColumns({
      columns,
      filters: filteredInfo
    });

    await this.setState({
      dataClone,
      columns: newColumn,
      filteredInfo,
      total: dataClone.length
    });
    // this.refreshByPage();
  };

  customSort = async sortedInfo => {
    const { field, order } = sortedInfo;
    if (typeof field === "undefined") {
      return;
    }

    let dataClone = db.handleSort({
      dataClone: this.state.dataClone,
      field,
      order
    });

    await this.setState({
      sortedInfo,
      dataClone
    });
    // this.refreshByPage();
  };

  handleChange = (pagination, filters, sorter) => {
    this.customFilter(filters);
    this.customSort(sorter);
    this.refreshByPage();
  };

  handleSearchChange = async e => {
    const keyword = e.target.value;
    let key = keyword.trim();
    let { dataClone, dataSearchClone } = this.state;

    if (key === "") {
      if (dataSearchClone.length) {
        dataClone = dataSearchClone;
      }
    } else {
      // 先将数据备份存储
      if (dataSearchClone.length === 0) {
        dataSearchClone = dataClone;
      } else {
        dataClone = dataSearchClone.filter(
          tr =>
            Object.values(tr)
              .slice(1)
              .filter(td => String(td).includes(key)).length
        );
      }
    }
    await this.setState({
      dataClone,
      dataSearchClone
    });

    this.refreshByPage();
  };

  getExportConfig = () => {
    const { columns, dataSrc, dataClone } = this.state;
    const { title } = dataSrc;

    const header = R.map(R.prop("title"))(columns);
    const filename = `${title}`;
    const keys = header.map((item, i) => "col" + i);
    const body = R.map(R.props(keys))(dataClone);
    return {
      filename,
      header,
      body
    };
  };

  downloadExcel = () => {
    const config = this.getExportConfig();
    config.filename = config.filename + ".xlsx";
    const xlsx = new Excel(config);
    xlsx.save();
  };

  downloadPdf = () => {
    const config = this.getExportConfig();
    config.download = "open";
    config.title = this.state.dataSrc.title;
    pdf(config);
  };

  // 为每行增加自定义附加操作
  appendActions = columns => {
    if (!this.props.actions) {
      return columns;
    }

    let actions = this.props.actions.map(({ title, render }, idx) => ({
      title,
      key: "col" + (columns.length + idx),
      dataIndex: "col" + (columns.length + idx),
      render: (text, record) => render(record)
    }));
    return [...columns, ...actions];
  };

  getTBody = () => {
    const {
      loading,
      columns,
      dataSource,
      source,
      timing,
      total,
      page,
      pageSize
    } = this.state;
    return (
      <>
        <Table
          loading={loading}
          columns={this.appendActions(columns)}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          size="medium"
          onChange={this.handleChange}
          footer={() => `${source} (共耗时${timing})`}
        />
        <Pagination
          className="ant-table-pagination"
          showTotal={(total, range) =>
            total ? `${range[0]}-${range[1]} 共 ${total} 条数据` : ""
          }
          showSizeChanger
          onShowSizeChange={this.onShowSizeChange}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.refreshByPage}
          pageSizeOptions={["5", "10", "15", "20", "30", "40", "50", "100"]}
        />
      </>
    );
  };

  tblTitle = () => {
    const { subTitle } = this.props;
    const { title } = this.state.dataSrc;
    return (
      title && (
        <div className={styles.tips}>
          <div className={styles.title}> {title} </div>
          <div className={styles.subTitle}> {subTitle} </div>
        </div>
      )
    );
  };
  render() {
    const tBody = this.getTBody();
    const tTitle = this.tblTitle();

    const Action = () => {
      const menu = (
        <Menu>
          <Menu.Item>
            <a rel="noopener noreferrer" onClick={this.downloadExcel}>
              <Icon type="file-excel" />
              excel
            </a>
          </Menu.Item>
          <Menu.Item>
            <a rel="noopener noreferrer" onClick={this.downloadPdf}>
              <Icon type="file-pdf" />
              PDF
            </a>
          </Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu}>
          <Button
            style={{
              marginLeft: 0
            }}
          >
            下载 <Icon type="down" />
          </Button>
        </Dropdown>
      );
    };

    return (
      <Card
        title={
          <div className={styles.header}>
            <Action />
            {tTitle}
            <div className={styles.search}>
              <Search
                placeholder="输入任意值过滤数据"
                onChange={this.handleSearchChange}
                style={{
                  width: 220,
                  height: 35
                }}
              />
            </div>
          </div>
        }
        style={{
          width: "100%",
          marginTop: 20
        }}
        bodyStyle={{
          padding: "0px 0px 12px 0px"
        }}
        className={styles.exCard}
      >
        {tBody}
      </Card>
    );
  }
}

Tables.defaultProps = {
  dataSrc: {
    data: [],
    title: "",
    rows: 0,
    time: "0ms",
    header: []
  },
  loading: false,
  cartLinkPrefix: setting.searchUrl,
  actions: false
};

export default Tables;
