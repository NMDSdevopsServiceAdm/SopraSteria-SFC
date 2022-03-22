import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { WdfDataStatusMessageComponent } from './wdf-data-status-message/wdf-data-status-message.component';
import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfParentStatusMessageComponent } from './wdf-parent-status-message/wdf-parent-status-message.component';
import { WdfRequirementsStateComponent } from './wdf-requirements-state/wdf-requirements-state.component';
import { WdfRoutingModule } from './wdf-routing.module';
import { WdfStaffRecordStatusMessageComponent } from './wdf-staff-record-status-message/wdf-staff-record-status-message.component';
import { WdfPaginationComponent } from './wdf-staff-record/wdf-pagination/wdf-pagination.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfStaffSummaryComponent } from './wdf-staff-summary/wdf-staff-summary.component';
import { WdfWorkplacesSummaryTableComponent } from './wdf-workplaces-summary-table/wdf-workplaces-summary-table.component';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary/wdf-workplaces-summary.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfRoutingModule],
  declarations: [
    WdfDataComponent,
    WdfStaffSummaryComponent,
    WdfStaffRecordComponent,
    WdfRequirementsStateComponent,
    WdfDataStatusMessageComponent,
    WdfStaffRecordStatusMessageComponent,
    WdfPaginationComponent,
    WdfWorkplacesSummaryComponent,
    WdfWorkplacesSummaryTableComponent,
    WdfParentStatusMessageComponent,
  ],
})
export class WdfModule {}
