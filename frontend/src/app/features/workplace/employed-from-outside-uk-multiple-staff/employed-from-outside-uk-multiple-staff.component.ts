import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employed-from-outside-uk-multiple-staff',
  templateUrl: './employed-from-outside-uk-multiple-staff.component.html',
})
export class EmployedFromOutsideUkMultipleStaffComponent implements OnInit {
  public workplaceUid: string;
  public submitted: boolean;
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  public return: URLStructure = { url: ['/dashboard'], fragment: 'home' };
  public workersWithHealthAndCareVisas: Array<any>;
  public workersWhichDontHaveHealthAndCareVisas: Array<any>;
  public answers: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private alertService: AlertService,
    private internationalRecruitmentService: InternationalRecruitmentService,
  ) {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.submitted = false;
    this.answers = this.internationalRecruitmentService.getEmployedFromOutsideUkAnswers();

    const allWorkers = this.getInternationalRecruitmentWorkers();

    if (!allWorkers) {
      this.router.navigate(['/workplace', this.workplaceUid, 'health-and-care-visa-existing-workers']);
    } else {
      this.workersWithHealthAndCareVisas = allWorkers.workersWithHealthAndCareVisas;
      this.workersWhichDontHaveHealthAndCareVisas = allWorkers.workersWhichDontHaveHealthAndCareVisas;

      this.setUpFormData();
      this.setupFormErrorsMap();
    }
  }

  get workers() {
    return this.form.get('workers') as FormArray;
  }

  private getInternationalRecruitmentWorkers(): any {
    const internationalRecruitmentWorkerAnswers =
      this.internationalRecruitmentService.getInternationalRecruitmentWorkerAnswers();

    if (internationalRecruitmentWorkerAnswers?.workplaceUid !== this.workplaceUid) {
      return null;
    }
    const workersWithHealthAndCareVisas = internationalRecruitmentWorkerAnswers.healthAndCareVisaWorkerAnswers.filter(
      (worker) => worker.healthAndCareVisa === 'Yes',
    );
    const workersWhichDontHaveHealthAndCareVisas =
      internationalRecruitmentWorkerAnswers.healthAndCareVisaWorkerAnswers.filter(
        (worker) => worker.healthAndCareVisa !== 'Yes',
      );

    if (!workersWithHealthAndCareVisas.length) return null;

    return { workersWithHealthAndCareVisas, workersWhichDontHaveHealthAndCareVisas };
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    this.establishmentService
      .updateWorkers(this.workplaceUid, this.workersWithHealthAndCareVisasWithNamesFiltered())
      .subscribe(
        () => this.onSubmitSuccess(),
        (error) => this.onSubmitError(error),
      );
  }

  protected setupFormErrorsMap(): void {
    this.workers.controls.forEach((_, index) => {
      this.formErrorsMap.push({
        item: `workers.insideOrOutsideUk.${index}`,
        type: [
          {
            name: 'required',
            message: `Select where your organisation employed ${this.workersWithHealthAndCareVisas[index].name}`,
          },
        ],
      });
    });
  }

  private workersWithHealthAndCareVisasWithNamesFiltered(): Array<any> {
    return [...this.workersWithHealthAndCareVisas, ...this.workersWhichDontHaveHealthAndCareVisas].map((worker) => {
      const { name, ...workerWithoutName } = worker;
      return workerWithoutName;
    });
  }

  private setUpFormData(): void {
    this.workersWithHealthAndCareVisas.forEach(() => {
      this.workers.push(this.createFormGroupForWorker());
    });
  }

  private createFormGroupForWorker(): FormGroup {
    return this.formBuilder.group({
      insideOrOutsideUk: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  public navigateToStaffRecord(event: Event, worker): void {
    event.preventDefault();
    this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', worker.uid, 'staff-record-summary']);
  }

  onSubmitSuccess(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Health and Care  Worker visa information saved',
      });
    });
  }

  radioChange(workerIndex, answerIndex): void {
    const updatedWorker = this.workersWithHealthAndCareVisas[workerIndex];
    updatedWorker.employedFromOutsideUk = this.answers[answerIndex].value;
  }

  onSubmitError(error): void {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
