import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { DataAreaTabModule } from '@shared/components/data-area-tab/data-area-tab.module';
import { SharedModule } from '@shared/shared.module';

import { ViewSubsidiaryBenchmarksComponent } from './benchmarks/view-subsidiary-benchmarks.component';
import { ViewSubsidiaryHomeComponent } from './home/view-subsidiary-home.component';
import { SubsidiaryRoutingModule } from './subsidiary-routing.module';
import {
  ViewSubsidiaryTrainingAndQualificationsComponent,
} from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, SubsidiaryRoutingModule,  BenchmarksModule,DataAreaTabModule,],
  declarations: [
    ViewSubsidiaryHomeComponent,
    ViewSubsidiaryWorkplaceComponent,
    ViewSubsidiaryHomeComponent,
    ViewSubsidiaryTrainingAndQualificationsComponent,
    ViewSubsidiaryBenchmarksComponent,
  ],
  providers: [SubsidiaryResolver],
})
export class SubsidiaryModule {}
