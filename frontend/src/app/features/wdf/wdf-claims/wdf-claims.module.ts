import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { WdfClaimsRoutingModule } from './wdf-claims-routing.module';
import { GrantLetterSentComponent } from './wdf-grant-letter/grant-leter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfClaimsRoutingModule],
  declarations: [WdfGrantLetterComponent, GrantLetterSentComponent],
})
export class WdfClaimsModule {}
