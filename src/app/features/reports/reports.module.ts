import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { EligibilityDisplayOverviewComponent } from './eligibility-display-overview/eligibility-display-overview.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { WdfReportComponent } from './wdf-report/wdf-report.component';
import { ReportsHeaderComponent } from './reports-header/reports-header.component';
import { UpdateWarningComponent } from './update-warning/update-warning.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, ReportsRoutingModule],
  declarations: [ReportsComponent, EligibilityDisplayOverviewComponent, WdfReportComponent, ReportsHeaderComponent, UpdateWarningComponent],
})
export class ReportsModule {}
