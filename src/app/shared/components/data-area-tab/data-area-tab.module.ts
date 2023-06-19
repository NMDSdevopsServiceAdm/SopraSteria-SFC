import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';

import { BenchmarksSelectComparisonGroupsComponent } from '../benchmarks-select-comparison-group/benchmarks-select-comparison-group.component';
import { BenchmarksSelectViewPanelComponent } from '../benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { DataAreaBarchartComponent } from './data-area-barchart/data-area-barchart.component';
import { DataAreaPayComponent } from './data-area-pay/data-area-pay.component';
import { DataAreaRankingComponent } from './data-area-ranking/data-area-ranking.component';
import { DataAreaRecruitmentAndRetentionComponent } from './data-area-recruitment-and-retention/data-area-recruiment-and-retention.component';
import { DataAreaRoutingModule } from './data-area-routing.module';
import { DataAreaTabComponent } from './data-area-tab.component';
import { DataAreaUsefulLinkComponent } from './data-area-useful-link/data-area-useful-link.component';
import { DownloadPdfComponent } from './download-pdf/download-pdf.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, HighchartsChartModule, SharedModule, DataAreaRoutingModule],
  declarations: [
    DataAreaAboutTheDataComponent,
    DataAreaBarchartComponent,
    DataAreaRankingComponent,
    DataAreaTabComponent,
    BenchmarksSelectViewPanelComponent,
    BenchmarksSelectComparisonGroupsComponent,
    DataAreaUsefulLinkComponent,
    DownloadPdfComponent,
    DataAreaPayComponent,
    DataAreaRecruitmentAndRetentionComponent,
  ],
  exports: [
    DataAreaAboutTheDataComponent,
    DataAreaBarchartComponent,
    DataAreaRankingComponent,
    DataAreaTabComponent,
    BenchmarksSelectViewPanelComponent,
    BenchmarksSelectComparisonGroupsComponent,
    DataAreaUsefulLinkComponent,
    DownloadPdfComponent,
    DataAreaPayComponent,
    DataAreaRecruitmentAndRetentionComponent,
  ],
  providers: [],
})
export class DataAreaTabModule {}
