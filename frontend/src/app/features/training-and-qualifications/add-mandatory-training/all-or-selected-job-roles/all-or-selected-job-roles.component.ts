import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { SelectedTraining } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

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
  public selectedRadio: string = null;
  public serverError: string;
  private subscriptions: Subscription = new Subscription();
  private establishment: Establishment;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    public route: ActivatedRoute,
    private trainingService: TrainingService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
  ) {
    this.setupForm();
  }

  ngOnInit(): void {
    this.establishment = this.route.snapshot.parent?.data?.establishment;
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

  private navigateToSelectJobRolesPage(): void {
    this.router.navigate(['../', 'select-job-roles'], { relativeTo: this.route });
  }

  private navigateBackToAddMandatoryTrainingPage(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public selectRadio(selectedRadio: string): void {
    this.selectedRadio = selectedRadio;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      if (this.selectedRadio == 'allJobRoles') {
        this.createMandatoryTraining();
      } else {
        this.navigateToSelectJobRolesPage();
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private createMandatoryTraining(): void {
    const props = {
      trainingCategoryId: this.selectedTrainingCategory.trainingCategory.id,
      allJobRoles: true,
      jobs: [],
    };

    this.subscriptions.add(
      this.establishmentService.createAndUpdateMandatoryTraining(this.establishment.uid, props).subscribe(
        () => {
          this.navigateBackToAddMandatoryTrainingPage();
          this.trainingService.resetState();

          this.alertService.addAlert({
            type: 'success',
            message: 'Mandatory training category added',
          });
        },
        () => {
          this.serverError = 'There has been a problem saving your mandatory training. Please try again.';
        },
      ),
    );
  }

  public onCancel(event: Event): void {
    event.preventDefault();

    this.trainingService.resetState();
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
