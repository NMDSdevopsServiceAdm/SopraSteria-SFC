import { Route, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { WorkplaceIsAwareOfCwpGuard } from '@core/guards/workplace-is-aware-of-cwp/workplace-is-aware-of-cwp.guard';
import { WorkplaceStaffDoDHAGuard } from '@core/guards/workplace-staff-do-dha/workplace-staff-do-dha.guard';
import { CareWorkforcePathwayUseReasonsResolver } from '@core/resolvers/care-workforce-pathway-use-reasons.resolver';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from '@core/resolvers/careWorkforcePathway/care-workforce-pathway-workplace-awareness';
import { CheckIfAnyWorkerHasDHAAnsweredResolver } from '@core/resolvers/delegated-healthcare-activities/check-if-any-worker-has-dha-answered.resolver';
import { GetDelegatedHealthcareActivitiesResolver } from '@core/resolvers/delegated-healthcare-activities/get-delegated-healthcare-activities.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';

import { AcceptPreviousCareCertificateComponent } from './accept-previous-care-certificate/accept-previous-care-certificate.component';
import { BenefitsStatutorySickPayComponent } from './benefits-statutory-sick-pay/benefits-statutory-sick-pay.component';
import { CareWorkforcePathwayAwarenessComponent } from './care-workforce-pathway-awareness/care-workforce-pathway-awareness.component';
import { CareWorkforcePathwayUseComponent } from './care-workforce-pathway-use/care-workforce-pathway-use.component';
import { CheckAnswersComponent } from './check-answers/check-answers.component';
import { DataSharingComponent } from './data-sharing/data-sharing.component';
import { DoYouHaveLeaversComponent } from './do-you-have-leavers/do-you-have-leavers.component';
import { DoYouHaveStartersComponent } from './do-you-have-starters/do-you-have-starters.component';
import { DoYouHaveVacanciesComponent } from './do-you-have-vacancies/do-you-have-vacancies.component';
import { HowManyLeaversComponent } from './how-many-leavers/how-many-leavers.component';
import { HowManyStartersComponent } from './how-many-starters/how-many-starters.component';
import { HowManyVacanciesComponent } from './how-many-vacancies/how-many-vacancies.component';
import { OtherServicesComponent } from './other-services/other-services.component';
import { PensionsComponent } from './pensions/pensions.component';
import { SelectLeaverJobRolesComponent } from './select-leaver-job-roles/select-leaver-job-roles.component';
import { SelectStarterJobRolesComponent } from './select-starter-job-roles/select-starter-job-roles.component';
import { SelectVacancyJobRolesComponent } from './select-vacancy-job-roles/select-vacancy-job-roles.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { StaffBenefitCashLoyaltyComponent } from './staff-benefit-cash-loyalty/staff-benefit-cash-loyalty.component';
import { StaffBenefitHolidayLeaveComponent } from './staff-benefit-holiday-leave/staff-benefit-holiday-leave.component';
import { StaffDoDelegatedHealthcareActivitiesComponent } from './staff-do-delegated-healthcase-activities/staff-do-delegated-healthcare-activities.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from './staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StaffWhatKindOfDelegatedHealthcareActivitiesComponent } from './staff-what-kind-of-delegated-healthcare-activities/staff-what-kind-of-delegated-healthcare-activities.component';
import { StartComponent } from './start/start.component';

const workplaceFlowOnlyPages: Routes = [
  {
    path: 'start',
    component: StartComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Start',
    },
  },
  {
    path: 'do-you-have-vacancies',
    component: DoYouHaveVacanciesComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Do You Have Vacancies',
    },
  },
  {
    path: 'select-vacancy-job-roles',
    component: SelectVacancyJobRolesComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: { jobs: JobsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Vacancies job role selection',
    },
  },
  {
    path: 'how-many-vacancies',
    component: HowManyVacanciesComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'How many vacancies',
    },
  },

  {
    path: 'do-you-have-starters',
    component: DoYouHaveStartersComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Do You Have Starters',
    },
  },
  {
    path: 'select-starter-job-roles',
    component: SelectStarterJobRolesComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: { jobs: JobsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Starters job role selection',
    },
  },
  {
    path: 'how-many-starters',
    component: HowManyStartersComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: { jobs: JobsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'How many starters',
    },
  },
  {
    path: 'do-you-have-leavers',
    component: DoYouHaveLeaversComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Do You Have Leavers',
    },
  },
  {
    path: 'select-leaver-job-roles',
    component: SelectLeaverJobRolesComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: { jobs: JobsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Leavers job role selection',
    },
  },
  {
    path: 'how-many-leavers',
    component: HowManyLeaversComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: { jobs: JobsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'How many leavers',
    },
  },
  {
    path: 'check-answers',
    component: CheckAnswersComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Check Answers',
    },
  },
];

export const workplaceQuestionsSharedByFlowAndSummary: Routes = [
  {
    path: 'other-services',
    component: OtherServicesComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Other Services',
    },
  },
  {
    path: 'service-users',
    component: ServiceUsersComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Service Users',
    },
  },
  {
    path: 'capacity-of-services',
    component: ServicesCapacityComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Capacity of Services',
    },
  },
  {
    path: 'staff-do-delegated-healthcare-activities',
    component: StaffDoDelegatedHealthcareActivitiesComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: {
      delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver,
      workerHasDHAAnswered: CheckIfAnyWorkerHasDHAAnsweredResolver,
    },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Staff do delegated healthcare activities',
    },
  },
  {
    path: 'what-kind-of-delegated-healthcare-activities',
    component: StaffWhatKindOfDelegatedHealthcareActivitiesComponent,
    canActivate: [CheckPermissionsGuard, WorkplaceStaffDoDHAGuard],
    resolve: { delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'What kind of delegated healthcare activities',
    },
  },

  {
    path: 'staff-recruitment-capture-training-requirement',
    component: StaffRecruitmentCaptureTrainingRequirementComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Staff Recruitment Capture Training Requirement',
    },
  },
  {
    path: 'accept-previous-care-certificate',
    component: AcceptPreviousCareCertificateComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Accept Previous Care Certificate',
    },
  },
  {
    path: 'care-workforce-pathway-awareness',
    component: CareWorkforcePathwayAwarenessComponent,
    canActivate: [CheckPermissionsGuard],
    resolve: {
      careWorkforcePathwayWorkplaceAwarenessAnswers: CareWorkforcePathwayWorkplaceAwarenessAnswersResolver,
    },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Care Workforce Pathway Awareness',
    },
  },
  {
    path: 'care-workforce-pathway-use',
    component: CareWorkforcePathwayUseComponent,
    canActivate: [CheckPermissionsGuard, WorkplaceIsAwareOfCwpGuard],
    resolve: { careWorkforcePathwayUseReasons: CareWorkforcePathwayUseReasonsResolver },
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Care workforce pathway use',
    },
  },
  {
    path: 'cash-loyalty',
    component: StaffBenefitCashLoyaltyComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Cash Loyalty',
    },
  },
  {
    path: 'benefits-statutory-sick-pay',
    component: BenefitsStatutorySickPayComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Benefits Statutory Sick Pay',
    },
  },
  {
    path: 'pensions',
    component: PensionsComponent,
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Pensions',
    },
  },
  {
    path: 'staff-benefit-holiday-leave',
    component: StaffBenefitHolidayLeaveComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Staff Benefit Holiday Leave',
    },
  },
  {
    path: 'sharing-data',
    component: DataSharingComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      permissions: ['canEditEstablishment'],
      title: 'Share Data',
    },
  },
];

// TODO: populate this array so that /workplace-data/workplace-summary/question-page-name work
const workplaceSummaryOnlyPages: Routes = [];

export const addWorkplaceDetails: Route = {
  path: 'add-workplace-details',
  children: [...workplaceFlowOnlyPages, ...workplaceQuestionsSharedByFlowAndSummary],
};

export const workplaceSummary: Route = {
  path: 'workplace-summary',
  children: [...workplaceSummaryOnlyPages, ...workplaceQuestionsSharedByFlowAndSummary],
};

export const WorkplaceDataRoutes: Route = { path: 'workplace-data', children: [addWorkplaceDetails, workplaceSummary] };
