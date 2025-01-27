import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { GetStartedComponent } from './get-started/get-started.component';
import { HelpRoutingModule } from './help-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, HelpRoutingModule],
  declarations: [GetStartedComponent],
  providers: [],
})
export class HelpModule {}
