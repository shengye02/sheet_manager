import React, { Suspense } from 'react';
import style from './index.less';
import { PageLoading } from '../components/';
import browsers from '@/utils/browser';

const IntroduceRow = React.lazy(() => import('./IntroduceRow'));

const ProductNum = React.lazy(() => import('./ProductNum'));
const Quality = React.lazy(() => import('./Quality'));
const FakePrint = React.lazy(() => import('./FakePrint'));

const ProductDetail = React.lazy(() => import('./ProductDetail'));

const PaperRun = React.lazy(() => import('./PaperRun'));

const CostAnany = React.lazy(() => import('./Cost'));

const EnergeyUseage = React.lazy(() => import('./EnergeUseage'));
const EnergeyLine = React.lazy(() => import('./EnergeLine'));
const EnergeyDetail = React.lazy(() => import('./EnergeDetail'));

const Storage = React.lazy(() => import('./Storage'));
const Storage2 = React.lazy(() => import('./Storage2'));

const PlanAnany = React.lazy(()=>import('./Plan'))

// XP系统不显示三维图表
let OS = browsers().os;
let isXP = OS == 'Windows XP';

export default () => {
  return (
    <div className={style.dashboard}>
      <Suspense fallback={<PageLoading />}>
        <IntroduceRow />
      </Suspense>
      <Suspense fallback={<PageLoading />}>
        <ProductNum />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <PlanAnany />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <CostAnany />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <ProductDetail />
      </Suspense>
      <Suspense fallback={<PageLoading />}>
        <Quality />
      </Suspense>
      <Suspense fallback={<PageLoading />}>
        <FakePrint />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <PaperRun />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <EnergeyUseage />
      </Suspense>
      <Suspense fallback={<PageLoading />}>
        <EnergeyLine />
      </Suspense>
      <Suspense fallback={<PageLoading />}>
        <EnergeyDetail />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <Storage2 />
      </Suspense>

{/* 立体库使用情况，功能不实用，内存消耗大，移除 */}
      {/* {!isXP && (
        <Suspense fallback={<PageLoading />}>
          <Storage />
        </Suspense>
      )} */}
    </div>
  );
};
