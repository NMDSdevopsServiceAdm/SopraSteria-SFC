import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { Worker } from '@core/model/worker.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { BackLinkService } from '@core/services/backLink.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { TrainingService } from '@core/services/training.service';
import { SelectTrainingCourseForTrainingRecordDirective } from '@shared/directives/select-training-course-for-training-record/select-training-course-for-training-record.directive';

@Component({
  selector: 'app-select-training-course-for-worker-training',
  templateUrl:
    '../../../shared//directives/select-training-course-for-training-record/select-training-course-for-training-record.component.html',
})
export class SelectTrainingCourseForWorkerTraining
  extends SelectTrainingCourseForTrainingRecordDirective
  implements OnInit, AfterViewInit
{
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected errorSummaryService: ErrorSummaryService,
    protected backLinkService: BackLinkService,
    protected previousRouteService: PreviousRouteService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      route,
      router,
      errorSummaryService,
      backLinkService,
      previousRouteService,
      trainingService,
      workerService,
      establishmentService,
    );
  }

  public setUpVariables(): void {
    this.continueWithOutCourseOptionText = 'Continue without selecting a saved course';
    this.headingText = 'Add a training record';
    this.sectionText = this.workerService.worker.nameOrId;
    this.previousPageToCheckWithoutTrainingCourse = 'add-training';
    this.previousPageToCheckWithTrainingCourse = 'matching-layout';
    this.routeWithoutTrainingCourse = [
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'add-training',
    ];

    this.routeWithTrainingCourse = [
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'matching-layout',
    ];
  }

  protected navigateOnCancelClick() {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'training',
    ]);
  }
}
