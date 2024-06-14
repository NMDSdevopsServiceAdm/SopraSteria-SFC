import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

@Component({
  selector: 'app-employed-from-outside-uk-multiple-staff',
  templateUrl: './employed-from-outside-uk-multiple-staff.component.html',
})
export class EmployedFromOutsideUkMultipleStaffComponent implements OnInit {
  private workplaceUid: string;
  public submitted: boolean;
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  public return: URLStructure = { url: ['/dashboard'], fragment: 'home' };
  public workersWithHealthAndCareVisas: any;
  public answers: any;

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private alertService: AlertService,
    private internationalRecruitmentService: InternationalRecruitmentService,
  ) {
    this.form = this.formBuilder.group({
      employedFromOutsideUKStaff: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.submitted = false;
    this.answers = this.internationalRecruitmentService.getEmployedFromOutsideUkAnswers();
    this.internationalRecruitmentService
      .getWorkersWithHealthAndCareVisaForWorkplace(this.workplaceUid)
      .subscribe((data) => {
        this.setUpFormData(data);
      });
  }

  get employedFromOutsideUKStaff() {
    return this.form.get('employedFromOutsideUKStaff') as FormArray;
  }

  onSubmit(): void {
    this.submitted = true;
    this.onSubmitSuccess();
  }

  private setUpFormData(data) {
    this.workersWithHealthAndCareVisas = data.workersWithHealthAndCareVisas;
    this.workersWithHealthAndCareVisas.forEach((worker) => {
      this.employedFromOutsideUKStaff.push(this.formBuilder.control({ ...worker, employedFromOutsideUK: null }));
    });
  }

  public navigateToStaffRecord(event: Event, worker): void {
    event.preventDefault();
    this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', worker.value.uid, 'staff-record-summary']);
  }

  onSubmitSuccess(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Health and Care  Worker visa information saved',
      });
    });
  }

  radioChange(workerIndex, answerIndex) {
    const updatedWorker = this.employedFromOutsideUKStaff.value[workerIndex];
    updatedWorker.employedFromOutsideUK = this.answers[answerIndex].value;
  }

  onSubmitError(error) {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }
}
