import React from 'react';
import { formatMessage } from 'umi/locale';
import { Link } from 'react-router-dom';
import Exception from 'ant-design-pro/lib/Exception';

const Exception403 = () => (
  <Exception
    type="403"
    desc={formatMessage({ id: 'app.exception.description.403' })}
    linkElement={Link}
    img="/img/403.svg"
    backText={formatMessage({ id: 'app.exception.back' })}
  />
);

export default Exception403;
