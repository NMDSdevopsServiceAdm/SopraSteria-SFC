import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { SelectedTraining } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-all-or-selected-job-roles',
  templateUrl: './all-or-selected-job-roles.component.html',
})
export class AllOrSelectedJobRolesComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: ErrorDetails[] = [];
  public returnTo: URLStructure;
  public workplaceUid: string;
  public requiredErrorMessage: string = 'Select whether this training is for all job roles or only selected job roles';
  public selectedTrainingCategory: SelectedTraining;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    public route: ActivatedRoute,
    private trainingService: TrainingService,
  ) {
    this.setupForm();
  }

  ngOnInit() {
    this.selectedTrainingCategory = this.trainingService.selectedTraining;

    if (!this.selectedTrainingCategory) {
      this.router.navigate(['../select-training-category'], { relativeTo: this.route });
    }

    this.backLinkService.showBackLink();
    this.workplaceUid = this.route.snapshot.data?.establishment?.uid;
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private navigateToNextPage() {
    this.router.navigate(['']);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({
      allOrSelectedJobRoles: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });

    this.formErrorsMap.push({
      item: 'allOrSelectedJobRoles',
      type: [
        {
          name: 'required',
          message: this.requiredErrorMessage,
        },
      ],
    });
  }
}
