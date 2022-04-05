import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { WdfClaimsRoutingModule } from './wdf-claims-routing.module';
import { GrantLetterCheckDetailsComponent } from './wdf-grant-letter/grant-letter-check-details/grant-letter-check-details.component';
import { GrantLetterSentComponent } from './wdf-grant-letter/grant-letter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfClaimsRoutingModule],
  declarations: [WdfGrantLetterComponent, GrantLetterSentComponent, GrantLetterCheckDetailsComponent],
})
export class WdfClaimsModule {}
