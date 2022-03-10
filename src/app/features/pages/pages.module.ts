import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { AboutUsComponent } from './about-us/about-us.component';
import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, PagesRoutingModule],
  declarations: [AboutUsComponent],
  providers: [],
})
export class PagesModule {}
