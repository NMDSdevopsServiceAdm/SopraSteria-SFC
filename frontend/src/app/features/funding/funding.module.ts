import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { SharedModule } from '@shared/shared.module';

import { FundingRequirementsComponent } from './funding-requirements/funding-requirements.component';
import { FundingRoutingModule } from './funding-routing.module';
import { LearnMoreAboutFundingComponent } from './learn-more-about-funding/learn-more-about-funding.component';
import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfStaffRecordStatusMessageComponent } from './wdf-staff-record-status-message/wdf-staff-record-status-message.component';
import { WdfPaginationComponent } from './wdf-staff-record/wdf-pagination/wdf-pagination.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfStaffSummaryComponent } from './wdf-staff-summary/wdf-staff-summary.component';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary/wdf-workplaces-summary.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, FundingRoutingModule],
  declarations: [
    WdfDataComponent,
    WdfStaffSummaryComponent,
    WdfStaffRecordComponent,
    WdfStaffRecordStatusMessageComponent,
    WdfPaginationComponent,
    WdfWorkplacesSummaryComponent,
    WdfOverviewComponent,
    FundingRequirementsComponent,
    LearnMoreAboutFundingComponent,
  ],
  providers: [WorkerResolver, WorkplaceResolver, JobsResolver],
})
export class FundingModule {}
