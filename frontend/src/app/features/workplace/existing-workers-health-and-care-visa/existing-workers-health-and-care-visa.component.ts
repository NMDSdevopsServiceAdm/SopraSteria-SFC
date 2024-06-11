import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { URLStructure } from '@core/model/url.model';
import { take } from 'rxjs/operators';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

@Component({
  selector: 'app-existing-workers-health-and-care-visa',
  templateUrl: 'existing-workers-health-and-care-visa.component.html',
})
export class ExistingWorkersHealthAndCareVisa implements OnInit, OnDestroy {
  public healthCareAndVisaAnswers = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  public form: FormGroup;
  public healthCareAndVisaWorkersList;
  public returnUrl: URLStructure = { url: ['/dashboard'] };
  public workplaceUid: string;
  public workers: Array<Worker>;
  public canViewWorker = false;
  public canEditWorker: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private internationalRecruitmentService: InternationalRecruitmentService,
  ) {
    this.form = this.formBuilder.group({
      healthCareAndVisaRadioList: this.formBuilder.array([]),
    });
  }

  ngOnInit() {
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    //this.getWorkers();
    //console.log(this.route.snapshot.data?.workers);
    this.getWorkers();

    // this.subscriptions.add(
    //   this.internationalRecruitmentService
    //     .getAllWorkersNationalityAndBritishCitizenship(this.workplaceUid)
    //     .subscribe((data) => {
    //       console.log(data);
    //     }),
    // );
  }

  private getWorkers(): void {
    if (this.canEditWorker) {
      this.subscriptions.add(
        this.internationalRecruitmentService
          .getAllWorkersNationalityAndBritishCitizenship(this.workplaceUid)
          .pipe(take(1))
          .subscribe(({ workers }) => {
            console.log(workers);
            this.healthCareAndVisaWorkersList = workers;
          }),
      );
    }
  }

  public onSubmit() {}

  public navigateToStaffRecords(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  // public getWorkers() {
  //   this.healthCareAndVisaWorkersList = [
  //     {
  //       id: '124r',
  //       name: 'Frank Abagnale',
  //     },
  //     {
  //       id: '124q',
  //       name: 'Henry Adams',
  //     },
  //     {
  //       id: '124g',
  //       name: 'Elly Connor',
  //     },
  //   ];
  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
