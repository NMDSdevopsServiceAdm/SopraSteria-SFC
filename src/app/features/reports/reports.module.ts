import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { ReportsHeaderComponent } from '@features/reports/components/reports-header/reports-header.component';
import { WdfEligibilityComponent } from '@features/reports/components/wdf-eligibility/wdf-eligibility.component';
import { WdfUpdateWarningComponent } from '@features/reports/components/wdf-update-warning/wdf-update-warning.component';
import { WdfWorkerComponent } from '@features/reports/pages/wdf-worker/wdf-worker.component';
import { WdfComponent } from '@features/reports/pages/wdf/wdf.component';
import { SharedModule } from '@shared/shared.module';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, ReportsRoutingModule],
  declarations: [
    ReportsComponent,
    WdfEligibilityComponent,
    WdfComponent,
    ReportsHeaderComponent,
    WdfWorkerComponent,
    WdfUpdateWarningComponent,
  ],
  providers: [WorkerResolver],
})
export class ReportsModule {}
