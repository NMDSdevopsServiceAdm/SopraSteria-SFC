import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { DialogService } from '@core/services/dialog.service';
import { ReportsHeaderComponent } from '@features/reports/components/reports-header/reports-header.component';
import { WdfEligibilityComponent } from '@features/reports/components/wdf-eligibility/wdf-eligibility.component';
import { WdfUpdateWarningComponent } from '@features/reports/components/wdf-update-warning/wdf-update-warning.component';
import { WdfComponent } from '@features/reports/pages/wdf/wdf.component';
import {
  WdfWorkplaceConfirmationDialogComponent,
} from '@features/workplace/wdf-workplace-confirmation-dialog/wdf-workplace-confirmation-dialog.component';
import { SharedModule } from '@shared/shared.module';

import { ReportsComponent } from './pages/reports/reports.component';
import { WorkplacesComponent } from './pages/workplaces/workplaces.component';
import { ReportsRoutingModule } from './reports-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, ReportsRoutingModule],
  declarations: [
    ReportsComponent,
    WdfEligibilityComponent,
    WdfComponent,
    ReportsHeaderComponent,
    WdfUpdateWarningComponent,
    WorkplacesComponent,
    WdfWorkplaceConfirmationDialogComponent,
  ],
  providers: [WorkerResolver, DialogService],
})
export class ReportsModule {}
