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

import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts/change-expires-soon-alerts.component';
import { CheckAnswersComponent } from './check-answers/check-answers.component';
import { ConfirmLeaversComponent } from './confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './confirm-vacancies/confirm-vacancies.component';
import { DataSharingComponent } from './data-sharing/data-sharing.component';
import { DeleteUserAccountComponent } from './delete-user-account/delete-user-account.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { LeaversComponent } from './leavers/leavers.component';
import { NumberOfInterviewsComponent } from './number-of-interviews/number-of-interviews.component';
import { OtherServicesComponent } from './other-services/other-services.component';
import { RecruitmentAdvertisingCostComponent } from './recruitment-advertising-cost/recruitment-advertising-cost.component';
import { RegulatedByCqcComponent } from './regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from './select-main-service/select-main-service.component';
import { SelectPrimaryUserDeleteComponent } from './select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from './select-primary-user/select-primary-user.component';
import { SelectWorkplaceComponent } from './select-workplace/select-workplace.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { StaffRecruitmentStartComponent } from './staff-recruitment/staff-recruitment-start.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from './staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StartersComponent } from './starters/starters.component';
import { TotalStaffQuestionComponent } from './total-staff-question/total-staff-question.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { UserAccountDeleteDialogComponent } from './user-account-delete-dialog/user-account-delete-dialog.component';
import { UserAccountEditDetailsComponent } from './user-account-edit-details/user-account-edit-details.component';
import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions/user-account-edit-permissions.component';
import { UsersComponent } from './users/users.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { ViewMyWorkplacesComponent } from './view-my-workplaces/view-my-workplaces.component';
import { ViewWorkplaceComponent } from './view-workplace/view-workplace.component';
import { WorkplaceInfoPanelComponent } from './workplace-info-panel/workplace-info-panel.component';
import { WorkplaceNameAddressComponent } from './workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';
import { WorkplaceRoutingModule } from './workplace-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, WorkplaceRoutingModule, BenchmarksModule],
  declarations: [
    CheckAnswersComponent,
    ConfirmLeaversComponent,
    ConfirmStartersComponent,
    ConfirmVacanciesComponent,
    CreateUserAccountComponent,
    DataSharingComponent,
    EditWorkplaceComponent,
    LeaversComponent,
    OtherServicesComponent,
    ServicesCapacityComponent,
    ServiceUsersComponent,
    StartComponent,
    StaffRecruitmentStartComponent,
    StartersComponent,
    TypeOfEmployerComponent,
    UserAccountDeleteDialogComponent,
    UserAccountEditPermissionsComponent,
    UserAccountSavedComponent,
    UserAccountViewComponent,
    TotalStaffQuestionComponent,
    VacanciesComponent,
    ViewMyWorkplacesComponent,
    ViewWorkplaceComponent,
    WorkplaceInfoPanelComponent,
    SelectMainServiceComponent,
    UserAccountEditDetailsComponent,
    RegulatedByCqcComponent,
    SelectWorkplaceComponent,
    WorkplaceNotFoundComponent,
    WorkplaceNameAddressComponent,
    SelectMainServiceCqcComponent,
    SelectMainServiceCqcConfirmComponent,
    DeleteUserAccountComponent,
    SelectPrimaryUserComponent,
    SelectPrimaryUserDeleteComponent,
    ChangeExpiresSoonAlertsComponent,
    UsersComponent,
    StaffRecruitmentCaptureTrainingRequirementComponent,
    RecruitmentAdvertisingCostComponent,
    NumberOfInterviewsComponent,
  ],
  providers: [
    DialogService,
    WorkplaceResolver,
    UserAccountResolver,
    ExpiresSoonAlertDatesResolver,
    ChildWorkplacesResolver,
    JobsResolver,
  ],
})
export class WorkplaceModule {}
