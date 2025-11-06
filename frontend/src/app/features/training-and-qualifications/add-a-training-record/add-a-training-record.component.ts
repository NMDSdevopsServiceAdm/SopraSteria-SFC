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

@Component({
  selector: 'app-add-a-training-record',
  templateUrl: './add-a-training-record.component.html',
})
export class AddATrainingRecord implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public worker: Worker;
  public trainingCourses: TrainingCourse[];
  public continueWithOutCourseOption = { id: 999, name: 'Continue without selecting a saved course' };
  public radioOptions = [];
  public submitted: boolean = false;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    protected errorSummaryService: ErrorSummaryService,
    protected backLinkService: BackLinkService,
    private previousRouteService: PreviousRouteService,
    public trainingService: TrainingService,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment;

    this.trainingCourses = this.route.snapshot.data?.trainingCourses;

    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
    this.prefillForm();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private prefillForm(): void {
    const previousPage = this.previousRouteService.getPreviousPage();
    const previousUrl = this.previousRouteService.getPreviousUrl();

    const isTrainingCourseSelected = this.trainingService.getIsTrainingCourseSelected();
    const selectedTrainingCourse = this.trainingService.getSelectedTrainingCourse();

    if (
      previousPage === 'add-training' &&
      typeof isTrainingCourseSelected !== 'undefined' &&
      isTrainingCourseSelected !== null
    ) {
      this.form.setValue({ addATrainingRecord: this.continueWithOutCourseOption.id });
    } else if (previousUrl?.includes('matching-layout') && isTrainingCourseSelected && selectedTrainingCourse?.id) {
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

  public navigateToNextPage(selectedOption: number): void {
    const trainingCoursesIds = this.trainingCourses.map((trainingCourse) => {
      return trainingCourse.id;
    });

    if (selectedOption === this.continueWithOutCourseOption.id) {
      this.router.navigate([
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'add-training',
      ]);
    } else if (trainingCoursesIds.includes(selectedOption)) {
      this.router.navigate([
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'matching-layout',
      ]);
    }
  }
}
