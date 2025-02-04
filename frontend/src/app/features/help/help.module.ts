import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { HelpRoutingModule } from './help-routing.module';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, HelpRoutingModule],
  declarations: [HelpAreaComponent, GetStartedComponent, WhatsNewComponent, ContactUsComponent],
  providers: [],
})
export class HelpModule {}
