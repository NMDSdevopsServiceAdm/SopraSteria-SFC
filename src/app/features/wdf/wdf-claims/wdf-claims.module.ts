import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { AddLearnersStartPageComponent } from './add-learners-start-page/add-learners-start-page.component';
import { MakeAClaimProgressBarComponent } from './make-a-claim-progress-bar/make-a-claim-progress-bar.component';
import { WdfClaimsRoutingModule } from './wdf-claims-routing.module';
import { GrantLetterSentComponent } from './wdf-grant-letter/grant-leter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WdfClaimsRoutingModule],
  declarations: [
    WdfGrantLetterComponent,
    GrantLetterSentComponent,
    AddLearnersStartPageComponent,
    MakeAClaimProgressBarComponent,
  ],
})
export class WdfClaimsModule {}
