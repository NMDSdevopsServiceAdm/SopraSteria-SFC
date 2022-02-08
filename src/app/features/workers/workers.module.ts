import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LongTermAbsenceResolver } from '@core/resolvers/long-term-absence.resolver';
import { QualificationResolver } from '@core/resolvers/qualification.resolver';
import { QualificationsResolver } from '@core/resolvers/qualifications.resolver';
import { TrainingAndQualificationRecordsResolver } from '@core/resolvers/training-and-qualification-records.resolver';
import { TrainingRecordResolver } from '@core/resolvers/training-record.resolver';
import { TrainingRecordsResolver } from '@core/resolvers/training-records.resolver';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { DialogService } from '@core/services/dialog.service';
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
import { DateOfBirthComponent } from './date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './days-of-sickness/days-of-sickness.component';
import { DeleteQualificationDialogComponent } from './delete-qualification-dialog/delete-qualification-dialog.component';
import { DeleteTrainingDialogComponent } from './delete-training-dialog/delete-training-dialog.component';
import { DeleteWorkerDialogComponent } from './delete-worker-dialog/delete-worker-dialog.component';
import { DisabilityComponent } from './disability/disability.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EthnicityComponent } from './ethnicity/ethnicity.component';
import { FluJabComponent } from './flu-jab/flu-jab.component';
import { GenderComponent } from './gender/gender.component';
import { HomePostcodeComponent } from './home-postcode/home-postcode.component';
import { LongTermAbsenceComponent } from './long-term-absence/long-term-absence.component';
import { MainJobStartDateComponent } from './main-job-start-date/main-job-start-date.component';
import { MandatoryDetailsComponent } from './mandatory-details/mandatory-details.component';
import { MentalHealthProfessionalComponent } from './mental-health-professional/mental-health-professional.component';
import { MoveWorkerDialogComponent } from './move-worker-dialog/move-worker-dialog.component';
import { NationalInsuranceNumberComponent } from './national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './nationality/nationality.component';
import { DeleteRecordComponent } from './new-training-qualifications-record/delete-record/delete-record.component';
import {
  MissingMandatoryTrainingComponent,
} from './new-training-qualifications-record/missing-mandatory-training/missing-mandatory-training.component';
import {
  NewQualificationsComponent,
} from './new-training-qualifications-record/new-qualifications/new-qualifications.component';
import {
  NewTrainingAndQualificationsRecordSummaryComponent,
} from './new-training-qualifications-record/new-training-and-qualifications-record-summary/new-training-and-qualifications-record-summary.component';
import {
  NewTrainingAndQualificationsRecordComponent,
} from './new-training-qualifications-record/new-training-and-qualifications-record.component';
import { NewTrainingComponent } from './new-training-qualifications-record/new-training/new-training.component';
import { NursingCategoryComponent } from './nursing-category/nursing-category.component';
import { NursingSpecialismComponent } from './nursing-specialism/nursing-specialism.component';
import { OtherJobRolesComponent } from './other-job-roles/other-job-roles.component';
import { OtherQualificationsLevelComponent } from './other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './recruited-from/recruited-from.component';
import { SalaryComponent } from './salary/salary.component';
import { SelectRecordTypeComponent } from './select-record-type/select-record-type.component';
import {
  SocialCareQualificationLevelComponent,
} from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { StaffRecordComponent } from './staff-record/staff-record.component';
import { TotalStaffChangeComponent } from './total-staff-change/total-staff-change.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { WorkerSaveSuccessComponent } from './worker-save-success/worker-save-success.component';
import { WorkersRoutingModule } from './workers-routing.module';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';

@NgModule({
  imports: [CommonModule, OverlayModule, FormsModule, ReactiveFormsModule, SharedModule, WorkersRoutingModule],
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
    DateOfBirthComponent,
    DaysOfSicknessComponent,
    DeleteQualificationDialogComponent,
    DeleteTrainingDialogComponent,
    DeleteWorkerDialogComponent,
    DeleteRecordComponent,
    DisabilityComponent,
    EditWorkerComponent,
    EthnicityComponent,
    FluJabComponent,
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
    RecruitedFromComponent,
    SalaryComponent,
    SocialCareQualificationComponent,
    SocialCareQualificationLevelComponent,
    StaffDetailsComponent,
    StaffRecordComponent,
    TotalStaffChangeComponent,
    WeeklyContractedHoursComponent,
    WorkerSaveSuccessComponent,
    YearArrivedUkComponent,
    SelectRecordTypeComponent,
    MoveWorkerDialogComponent,
    MandatoryDetailsComponent,
    LongTermAbsenceComponent,
    NewTrainingAndQualificationsRecordComponent,
    NewTrainingComponent,
    NewQualificationsComponent,
    NewTrainingAndQualificationsRecordSummaryComponent,
    MissingMandatoryTrainingComponent,
  ],
  providers: [
    DialogService,
    WorkerResolver,
    LongTermAbsenceResolver,
    QualificationResolver,
    QualificationsResolver,
    TrainingRecordResolver,
    TrainingRecordsResolver,
    TrainingAndQualificationRecordsResolver,
  ],
})
export class WorkersModule {}
