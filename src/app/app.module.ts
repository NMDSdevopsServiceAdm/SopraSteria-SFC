import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';

import { CqcRegisteredQuestionComponent } from './features/cqc-registered-question/cqc-registered-question.component';
import { CqcRegisteredQuestionEditComponent } from './features/cqc-registered-question/cqc-registered-question-edit/cqc-registered-question-edit.component';

import { ConfirmWorkplaceDetailsComponent } from './features/confirm-workplace-details/confirm-workplace-details.component';
import { SelectWorkplaceComponent } from './features/select-workplace/select-workplace.component';
import { SelectWorkplaceAddressComponent } from './features/select-workplace-address/select-workplace-address.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';
import { CreateUsernameComponent } from './features/create-username/create-username.component';
import { SecurityQuestionComponent } from './features/security-question/security-question.component';
import { ConfirmAccountDetailsComponent } from './features/confirm-account-details/confirm-account-details.component';
import { RegistrationCompleteComponent } from './features/registration-complete/registration-complete.component';
import { EnterWorkplaceAddressComponent } from './features/enter-workplace-address/enter-workplace-address.component';
import { SelectMainServiceComponent } from './features/select-main-service/select-main-service.component';
import { ContinueCreatingAccountComponent } from './features/continue-creating-account/continue-creating-account.component';
import { VacanciesComponent } from './features/vacancies/vacancies.component';
import { ConfirmVacanciesComponent } from './features/confirm-vacancies/confirm-vacancies.component'
import { StartersComponent } from './features/starters/starters.component'
import { ConfirmStartersComponent } from './features/confirm-starters/confirm-starters.component'
import { LeaversComponent } from './features/leavers/leavers.component';
import { ConfirmLeaversComponent } from './features/confirm-leavers/confirm-leavers.component';
import { StaffComponent } from './features/staff/staff.component';
import { ServicesCapacityComponent } from './features/services-capacity/services-capacity.component';
import { SharingComponent } from './features/sharing/sharing.component';
import { MessagesComponent } from './core/messages/messages.component';
import { ShareLocalAuthorityComponent } from './features/shareLocalAuthorities/shareLocalAuthority.component';
import { ShareOptionsComponent } from './features/shareOptions/shareOptions.component';
import { FeedbackComponent } from './features/feedback/feedback.component';

import { Number } from "./shared/number.directive"
import { NumberIntOnly } from "./shared/number-int-only.directive"
import { NumberMax } from "./shared/number-max.directive"
import { NumberPositiveOnly } from "./shared/number-positive-only.directive"
import { NoPaste } from "./shared/no-paste.directive"
import { LocationService } from './core/services/location.service';
import { RegistrationService } from './core/services/registration.service';
import { HomepageComponent } from './features/homepage/homepage.component';
import { SelectOtherServicesComponent } from './features/select-other-services/select-other-services.component';
import { SelectOtherServicesListComponent } from './features/select-other-services/select-other-services-list/select-other-services-list.component';
import { TypeOfEmployerComponent } from './features/type-of-employer/type-of-employer.component';
import { JobService } from "./core/services/job.service";
import { HttpErrorHandler } from "./core/services/http-error-handler.service"
import { MessageService } from "./core/services/message.service";
import { FeedbackService } from "./core/services/feedback.service";
import { TermsConditionsComponent } from './shared/terms-conditions/terms-conditions.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    CqcRegisteredQuestionComponent,
    CqcRegisteredQuestionEditComponent,
    ConfirmWorkplaceDetailsComponent,
    SelectWorkplaceComponent,
    SelectWorkplaceAddressComponent,
    UserDetailsComponent,
    CreateUsernameComponent,
    SecurityQuestionComponent,
    ConfirmAccountDetailsComponent,
    RegistrationCompleteComponent,
    EnterWorkplaceAddressComponent,
    SelectMainServiceComponent,
    ContinueCreatingAccountComponent,
    HomepageComponent,
    SelectOtherServicesComponent,
    SelectOtherServicesListComponent,
    TypeOfEmployerComponent,
    Number,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    VacanciesComponent,
    ConfirmVacanciesComponent,
    StartersComponent,
    MessagesComponent,
    ConfirmStartersComponent,
    LeaversComponent,
    ConfirmLeaversComponent,
    StaffComponent,
    ServicesCapacityComponent,
    SharingComponent,
    ShareLocalAuthorityComponent,
    ShareOptionsComponent,
    FeedbackComponent,
    TermsConditionsComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      }
    ])
  ],
  providers: [
    LocationService,
    RegistrationService,
    JobService,
    MessageService,
    HttpErrorHandler,
    FeedbackService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
