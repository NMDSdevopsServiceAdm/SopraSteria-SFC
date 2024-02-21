import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { SharedModule } from '@shared/shared.module';

import { SubsidiaryRoutingModule } from './subsidiary-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    SubsidiaryRoutingModule,
  ],
  declarations: [
  ],
  providers: [
    SubsidiaryResolver,
  ],
})
export class SubsidiaryModule {}
