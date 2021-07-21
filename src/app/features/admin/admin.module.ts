import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing.module';
import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, AdminRoutingModule, RouterModule],
  declarations: [AdminMenuComponent, LocalAuthoritiesReturnComponent, AdminComponent],
  providers: [],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
