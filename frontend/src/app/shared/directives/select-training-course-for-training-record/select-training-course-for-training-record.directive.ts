import { Directive, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';

@Directive()
export class SelectTrainingCourseForTrainingRecordDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public worker: Worker;
  public sectionText = '';
  public headingText = '';
  public trainingCourses: TrainingCourse[];
  public continueWithOutCourseOptionText: string;
  public continueWithOutCourseOption = { id: 999, name: '' };
  public radioOptions = [];
  public submitted: boolean = false;
  public formErrorsMap: Array<ErrorDetails>;
  public trainingCoursesIds = [];
  public routeWithoutTrainingCourse = [];
  public routeWithTrainingCourse = [];
  public previousPageToCheckWithoutTrainingCourse: string;
  public previousPageToCheckWithTrainingCourse: string;

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
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment;

    this.trainingCourses = this.route.snapshot.data?.trainingCourses;
    this.setUpVariables();
    this.continueWithOutCourseOption.name = this.continueWithOutCourseOptionText;
    this.init();
    this.setupForm();

    this.setupFormErrorsMap();
    this.setBackLink();
    this.prefillForm();
    this.trainingCoursesIds = this.trainingCourses.map((trainingCourse) => {
      return trainingCourse.id;
    });
  }

  protected init(): void {}
  protected setUpVariables(): void {}
  protected navigateOnCancelClick(): void {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private prefillForm(): void {
    const previousPage = this.previousRouteService.getPreviousPage();
    const previousUrl = this.previousRouteService.getPreviousUrl();

    const isTrainingCourseSelected = this.trainingService.getIsTrainingCourseSelected();
    const selectedTrainingCourse = this.trainingService.getSelectedTrainingCourse();

    if (previousPage === this.previousPageToCheckWithoutTrainingCourse && isTrainingCourseSelected === false) {
      this.form.setValue({ addATrainingRecord: this.continueWithOutCourseOption.id });
    } else if (
      previousUrl?.includes(this.previousPageToCheckWithTrainingCourse) &&
      isTrainingCourseSelected &&
      selectedTrainingCourse?.id
    ) {
      this.form.setValue({ addATrainingRecord: selectedTrainingCourse.id });
    }
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'addATrainingRecord',
        type: [
          {
            name: 'required',
            message: 'Continue without selecting a saved course or select a saved course',
          },
        ],
      },
    ];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        addATrainingRecord: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      const answer = this.form.value.addATrainingRecord;

      if (answer === this.continueWithOutCourseOption.id) {
        this.trainingService.setIsTrainingCourseSelected(false);
      } else {
        this.trainingService.setIsTrainingCourseSelected(true);

        const selectedTrainingCourse = this.trainingCourses.find((trainingCourse) => {
          return trainingCourse.id === answer;
        });

        this.trainingService.setSelectedTrainingCourse(selectedTrainingCourse);
      }

      this.navigateToNextPage(answer);
    }
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.navigateOnCancelClick();
  }

  public navigateToNextPage(selectedOption: number): void {
    if (selectedOption === this.continueWithOutCourseOption.id) {
      this.router.navigate(this.routeWithoutTrainingCourse);
    } else if (this.trainingCoursesIds.includes(selectedOption)) {
      this.router.navigate(this.routeWithTrainingCourse);
    }
  }
}
