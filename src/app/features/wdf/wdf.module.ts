import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfRoutingModule } from './wdf-routing.module';
import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfStaffSummaryComponent } from './wdf-staff-summary/wdf-staff-summary.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfRoutingModule],
  declarations: [WdfOverviewComponent, WdfDataComponent, WdfStaffSummaryComponent],
})
export class WdfModule {}
