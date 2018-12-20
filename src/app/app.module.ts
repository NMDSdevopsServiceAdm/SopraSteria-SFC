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

import { LocationService } from './core/services/location.service';
import { RegistrationService } from './core/services/registration.service';
import { HomepageComponent } from './features/homepage/homepage.component';
import { SelectOtherServicesComponent } from './features/select-other-services/select-other-services.component';
import { SelectOtherServicesListComponent } from './features/select-other-services/select-other-services-list/select-other-services-list.component';

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
    SelectOtherServicesListComponent
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
    RegistrationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
