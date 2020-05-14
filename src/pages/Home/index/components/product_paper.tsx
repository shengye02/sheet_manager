import React from 'react';

import { Card, Button } from 'antd';

export default () => {
  return (
    <Card
      title="钞纸生产计划完成率"
      bodyStyle={{ height: 300 }}
      extra={
        <Button type="default" size="small">
          查看详情
        </Button>
      }
    >
      待添加内容，约定实际产量/计划口径及录入
    </Card>
  );
};