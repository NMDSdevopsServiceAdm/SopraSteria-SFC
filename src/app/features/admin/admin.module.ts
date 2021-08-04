import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { SharedModule } from '@shared/shared.module';

import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing.module';
import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, AdminRoutingModule, RouterModule],
  declarations: [
    AdminMenuComponent,
    LocalAuthoritiesReturnComponent,
    AdminComponent,
    SearchComponent,
    SetDatesComponent,
    MonitorComponent,
  ],
  providers: [LocalAuthoritiesReturnService, GetDatesResolver],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
