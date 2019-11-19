import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { DialogService } from '@core/services/dialog.service';
import { WdfStaffSummaryComponent } from '@features/workers/wdf-staff-summary/wdf-staff-summary.component';
import { SharedModule } from '@shared/shared.module';

import { AddEditQualificationComponent } from './add-edit-qualification/add-edit-qualification.component';
import { QualificationFormComponent } from './add-edit-qualification/qualification-form/qualification-form.component';
import { AddEditTrainingComponent } from './add-edit-training/add-edit-training.component';
import { AdultSocialCareStartedComponent } from './adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from './apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from './average-weekly-hours/average-weekly-hours.component';
import { BasicRecordsSaveSuccessComponent } from './basic-records-save-success/basic-records-save-success.component';
import { BritishCitizenshipComponent } from './british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from './care-certificate/care-certificate.component';
import { CheckStaffRecordComponent } from './check-staff-record/check-staff-record.component';
import { ContractWithZeroHoursComponent } from './contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './country-of-birth/country-of-birth.component';
import {
  CreateBasicRecordsStartScreenComponent,
} from './create-basic-records-start-screen/create-basic-records-start-screen.component';
import { CreateBasicRecordsComponent } from './create-basic-records/create-basic-records.component';
import {
  CreateStaffRecordStartScreenComponent,
} from './create-staff-record-start-screen/create-staff-record-start-screen.component';
import { DateOfBirthComponent } from './date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './days-of-sickness/days-of-sickness.component';
import { DeleteQualificationDialogComponent } from './delete-qualification-dialog/delete-qualification-dialog.component';
import { DeleteTrainingDialogComponent } from './delete-training-dialog/delete-training-dialog.component';
import { DeleteWorkerDialogComponent } from './delete-worker-dialog/delete-worker-dialog.component';
import { DisabilityComponent } from './disability/disability.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EthnicityComponent } from './ethnicity/ethnicity.component';
import { GenderComponent } from './gender/gender.component';
import { HomePostcodeComponent } from './home-postcode/home-postcode.component';
import { MainJobStartDateComponent } from './main-job-start-date/main-job-start-date.component';
import { MentalHealthProfessionalComponent } from './mental-health-professional/mental-health-professional.component';
import { NationalInsuranceNumberComponent } from './national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './nationality/nationality.component';
import { NursingCategoryComponent } from './nursing-category/nursing-category.component';
import { NursingSpecialismComponent } from './nursing-specialism/nursing-specialism.component';
import { OtherJobRolesComponent } from './other-job-roles/other-job-roles.component';
import { OtherQualificationsLevelComponent } from './other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './recruited-from/recruited-from.component';
import { SalaryComponent } from './salary/salary.component';
import { SelectRecordTypeComponent, SelectRecordTypeComponent } from './select-record-type/select-record-type.component';
import {
  SocialCareQualificationLevelComponent,
} from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { StaffRecordComponent } from './staff-record/staff-record.component';
import { TotalStaffComponent } from './total-staff/total-staff.component';
import { QualificationsComponent } from './training-qualifications-record/qualifications/qualifications.component';
import {
  TrainingAndQualificationsRecordComponent,
} from './training-qualifications-record/training-and-qualifications-record.component';
import { TrainingComponent } from './training-qualifications-record/training/training.component';
import {
  WdfWorkerConfirmationDialogComponent,
} from './wdf-worker-confirmation-dialog/wdf-worker-confirmation-dialog.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { WorkerSaveSuccessComponent } from './worker-save-success/worker-save-success.component';
import { WorkersRoutingModule } from './workers-routing.module';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';

//import { QualificationsComponent } from './staff-record/qualifications/qualifications.component';
//import { TrainingComponent } from './staff-record/training/training.component';
@NgModule({
  imports: [CommonModule, OverlayModule, ReactiveFormsModule, SharedModule, WorkersRoutingModule],
  declarations: [
    AddEditQualificationComponent,
    AddEditTrainingComponent,
    AdultSocialCareStartedComponent,
    ApprenticeshipTrainingComponent,
    AverageWeeklyHoursComponent,
    BasicRecordsSaveSuccessComponent,
    BritishCitizenshipComponent,
    CareCertificateComponent,
    CheckStaffRecordComponent,
    ContractWithZeroHoursComponent,
    CountryOfBirthComponent,
    CreateBasicRecordsComponent,
    CreateBasicRecordsStartScreenComponent,
    CreateStaffRecordStartScreenComponent,
    DateOfBirthComponent,
    DaysOfSicknessComponent,
    DeleteQualificationDialogComponent,
    DeleteTrainingDialogComponent,
    DeleteWorkerDialogComponent,
    DisabilityComponent,
    EditWorkerComponent,
    EthnicityComponent,
    GenderComponent,
    HomePostcodeComponent,
    MainJobStartDateComponent,
    MentalHealthProfessionalComponent,
    NationalInsuranceNumberComponent,
    NationalityComponent,
    NursingCategoryComponent,
    NursingSpecialismComponent,
    OtherJobRolesComponent,
    OtherQualificationsComponent,
    OtherQualificationsLevelComponent,
    QualificationFormComponent,
    QualificationsComponent,
    RecruitedFromComponent,
    SalaryComponent,
    SocialCareQualificationComponent,
    SocialCareQualificationLevelComponent,
    StaffDetailsComponent,
    StaffRecordComponent,
    TotalStaffComponent,
    TrainingComponent,
    WeeklyContractedHoursComponent,
    WorkerSaveSuccessComponent,
    YearArrivedUkComponent,
    WdfStaffSummaryComponent,
    WdfWorkerConfirmationDialogComponent,
    TrainingAndQualificationsRecordComponent,
    SelectRecordTypeComponent,
  ],
  providers: [DialogService, WorkerResolver],
  entryComponents: [
    DeleteQualificationDialogComponent,
    DeleteTrainingDialogComponent,
    DeleteWorkerDialogComponent,
    WdfWorkerConfirmationDialogComponent,
  ],
})
export class WorkersModule {}
