import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfRoutingModule } from './wdf-routing.module';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfStaffSummaryComponent } from './wdf-staff-summary/wdf-staff-summary.component';
import { WdfRequirementsStateComponent } from './wdf-requirements-state/wdf-requirements-state.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfRoutingModule],
  declarations: [WdfOverviewComponent, WdfDataComponent, WdfStaffSummaryComponent, WdfStaffRecordComponent, WdfRequirementsStateComponent],
})
export class WdfModule {}
