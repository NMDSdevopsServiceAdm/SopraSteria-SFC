import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { BackLinkService } from '@core/services/backLink.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { TrainingService } from '@core/services/training.service';
import { SelectTrainingCourseForTrainingRecordDirective } from '@shared/directives/select-training-course-for-training-record/select-training-course-for-training-record.directive';
import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-select-training-course-for-worker-training',
  templateUrl:
    '../../../shared/directives/select-training-course-for-training-record/select-training-course-for-training-record.component.html',
  standalone: false,
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
    this.headingText = 'Add a training record';
    this.sectionText = this.workerService.worker.nameOrId;
    this.previousPageToCheckWithoutTrainingCourse = 'add-training';
    this.previousPageToCheckWithTrainingCourse = 'matching-layout';
    this.courseOptionsSubText = 'Select a training course for this record';
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

  protected loadTrainingCourses(): void {
    const allTrainingCourseInWorkplace = this.route.snapshot.data?.trainingCourses;
    const categoryToShow: string = this.route.snapshot.queryParams?.trainingCategory;

    if (categoryToShow) {
      const categoryId = JSON.parse(categoryToShow)?.id;

      this.trainingCourses = allTrainingCourseInWorkplace.filter((course) => course.trainingCategoryId === categoryId);
      return;
    }

    this.trainingCourses = allTrainingCourseInWorkplace;
  }

  protected continueWithoutTrainingCourse(): void {
    const queryParamsFromPreviousPage = this.route.snapshot.queryParams;

    if (queryParamsFromPreviousPage) {
      this.router.navigate(this.routeWithoutTrainingCourse, { queryParams: queryParamsFromPreviousPage });
    } else {
      this.router.navigate(this.routeWithoutTrainingCourse);
    }
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

  protected clearSelectedTrainingCourseWhenClickedAway() {
    const thisPageUrl = this.router.url;
    const nextPageWithTrainingCourse = this.routeWithTrainingCourse.join('/');
    const hasClickedAway = (event: NavigationEnd) => {
      const isThisPage = event.urlAfterRedirects?.includes(thisPageUrl);
      const isConfirmationPage = event.urlAfterRedirects?.includes(nextPageWithTrainingCourse);

      return !isThisPage && !isConfirmationPage;
    };

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(hasClickedAway),
        take(1),
      )
      .subscribe(() => {
        this.trainingService.setSelectedTrainingCourse(null);
      });
  }
}
