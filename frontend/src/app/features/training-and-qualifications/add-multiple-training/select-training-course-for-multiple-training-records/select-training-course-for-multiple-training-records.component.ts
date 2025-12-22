import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { SelectTrainingCourseForTrainingRecordDirective } from '@shared/directives/select-training-course-for-training-record/select-training-course-for-training-record.directive';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-select-training-course-for-multiple-training-records',
  templateUrl:
    '../../../../shared/directives/select-training-course-for-training-record/select-training-course-for-training-record.component.html',
  standalone: false,
})
export class SelectTrainingCourseForMultipleTrainingRecords
  extends SelectTrainingCourseForTrainingRecordDirective
  implements OnInit
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

  protected init(): void {}

  public setUpVariables(): void {
    this.headingText = 'How do you want to continue?';
    this.sectionText = 'Add multiple training records';
    this.previousPageToCheckWithoutTrainingCourse = 'add-multiple-training';
    this.previousPageToCheckWithTrainingCourse = 'update-url';
    this.courseOptionsSubText = 'Select the training course taken';
    this.routeWithoutTrainingCourse = [
      '/workplace',
      this.workplace.uid,
      'add-multiple-training',
      'select-training-category',
    ];

    this.routeWithTrainingCourse = [
      '/workplace',
      this.workplace.uid,
      'add-multiple-training',
      'view-selected-training-course-details',
    ];
  }

  protected navigateOnCancelClick() {
    this.router.navigate(['dashboard'], { fragment: 'training-and-qualifications' });
  }

  protected clearSelectedTrainingCourseWhenClickedAway() {
    const parentPath = 'add-multiple-training';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.trainingService.setSelectedTrainingCourse(null);
      });
  }
}
