import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { DialogService } from '@core/services/dialog.service';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { SelectMainServiceCqcConfirmComponent } from '@features/workplace/select-main-service/select-main-service-cqc-confirm.component';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { StartComponent } from '@features/workplace/start/start.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { SharedModule } from '@shared/shared.module';

import { StaffRecruitmentRoutingModule } from './staff-recruitment-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    StaffRecruitmentRoutingModule,
    BenchmarksModule,
  ],
  declarations: [StartComponent],
  providers: [
    DialogService,
    WorkplaceResolver,
    UserAccountResolver,
    ExpiresSoonAlertDatesResolver,
    ChildWorkplacesResolver,
    JobsResolver,
  ],
})
export class StaffRecruitmentModule {}
