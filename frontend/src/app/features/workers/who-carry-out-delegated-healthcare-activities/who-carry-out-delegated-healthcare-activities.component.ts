import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { AbstractControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { JobRole } from '@core/model/job.model';
import {
  DelegatedHealthcareActivitiesService,
  DHAGetAllWorkersResponse,
} from '@core/services/delegated-healthcare-activities.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-who-carry-out-delegated-healthcare-activities',
  templateUrl: './who-carry-out-delegated-healthcare-activities.component.html',
})
export class WhoCarryOutDelegatedHealthcareActivitiesComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }> = [];
  public workerCount: number;
  public itemsPerPage: number = 15;
  public pageIndex: number = 0;
  public submitted: boolean;
  public serverError: string;
  @ViewChild('formEl') formEl: ElementRef;
  public section = 'Employment details';
  public heading = 'Who carries out delegated healthcare activities?';

  public avaliaAnswers = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];
  public dhaDefinition: string;

  public form: FormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,

    private route: ActivatedRoute,
  ) {
    this.form = this.formBuilder.group({
      healthAndCareVisaRadioList: this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.handleGetWorkersResponse(this.route.snapshot.data.workerWhoRequireDHAAnswer);
    this.initialiseForm();
    this.dhaDefinition = this.delegatedHealthcareActivitiesService.dhaDefinition;
  }

  private getWorkers(): void {
    const queryParams = { pageIndex: this.pageIndex, itemsPerPage: this.itemsPerPage };

    this.subscriptions.add(
      this.delegatedHealthcareActivitiesService
        .getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(this.workplaceUid, queryParams)
        .pipe(take(1))
        .subscribe((response) => this.handleGetWorkersResponse(response)),
    );
  }

  private handleGetWorkersResponse(response: DHAGetAllWorkersResponse): void {
    if (response?.workers?.length) {
      this.workersToShow = response.workers;
      this.workerCount = response?.workerCount;
    } else {
      this.returnToHome();
    }
  }

  get healthAndCareVisaRadioList(): FormGroup {
    return this.form.get('healthAndCareVisaRadioList') as FormGroup;
  }

  get healthAndCareVisaRadioListValues(): AbstractControl[] {
    return Object.values(this.healthAndCareVisaRadioList.controls);
  }

  initialiseForm(): void {
    for (let i = 0; i < this.workersToShow.length; i++) {
      this.healthAndCareVisaRadioList.addControl(this.workersToShow[i].uid, this.createFormGroupForWorker());
    }
  }

  private createFormGroupForWorker(): FormGroup {
    return this.formBuilder.group({
      healthAndCareVisa: null,
    });
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  public onSubmit(): void {}

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }
}
