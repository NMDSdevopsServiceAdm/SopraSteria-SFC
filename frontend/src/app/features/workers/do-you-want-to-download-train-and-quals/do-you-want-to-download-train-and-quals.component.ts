import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCertificateService, QualificationCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { WorkerService } from '@core/services/worker.service';
import { FileUtil } from '@core/utils/file-util';
import { from, merge, Subscription } from 'rxjs';
import { mergeMap, take, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-do-you-want-to-download-train-and-quals',
  templateUrl: './do-you-want-to-download-train-and-quals.component.html',
})
export class DoYouWantToDowloadTrainAndQualsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public worker: Worker;
  public workplace: Establishment;
  public ctaText = 'Continue';
  public exitText = 'Cancel';
  public previousRoute: string[];
  public nextRoute: string[];
  public returnUrl: URLStructure;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();
  private downloadingAllCertsInBackground = false;

  constructor(
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
    private backLinkService: BackLinkService,
    private alertService: AlertService,
    private errorSummaryService: ErrorSummaryService,
    private previousRouteService: PreviousRouteService,
    private trainingCertificateService: TrainingCertificateService,
    private qualificationCertificateService: QualificationCertificateService,
  ) {
    this.form = this.formBuilder.group(
      {
        downloadTrainAndQuals: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );
    this.previousRoute = ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'];
    this.nextRoute = ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'delete-staff-record'];
    this.setBackLink();
    this.setupFormErrorsMap();
    this.returnUrl = {
      url: this.previousRoute,
    };
    this.prefill();
  }

  private prefill(): void {
    const previousPage = this.previousRouteService.getPreviousPage();
    const previousAnswer = this.workerService.getDoYouWantToDownloadTrainAndQualsAnswer();

    if (previousAnswer && previousPage === 'delete-staff-record') {
      this.form.patchValue({
        downloadTrainAndQuals: previousAnswer,
      });
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'downloadTrainAndQuals',
        type: [
          {
            name: 'required',
            message: 'Select yes if you want to download the summary and any certificates',
          },
        ],
      },
    ];
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public downloadAllCertificates(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.downloadingAllCertsInBackground) {
        return;
      }

      this.downloadingAllCertsInBackground = true;

      const allTrainingCerts$ = this.trainingCertificateService.downloadAllCertificatesAsBlobs(
        this.workplace.uid,
        this.worker.uid,
      );
      const allQualificationCerts$ = this.qualificationCertificateService.downloadAllCertificatesAsBlobs(
        this.workplace.uid,
        this.worker.uid,
      );

      const zipFileName = this.worker.nameOrId
        ? `All certificates - ${this.worker.nameOrId}.zip`
        : 'All certificates.zip';

      const downloadAllCertificatesAsZip$ = merge(allTrainingCerts$, allQualificationCerts$).pipe(
        toArray(),
        mergeMap((allFileBlobs) => from(FileUtil.saveFilesAsZip(allFileBlobs, zipFileName))),
      );

      this.subscriptions.add(
        downloadAllCertificatesAsZip$.subscribe(
          () => {
            this.downloadingAllCertsInBackground = false;
            resolve(true);
          },
          (err) => {
            console.error('Error occurred when downloading all certificates: ', err);
            this.downloadingAllCertsInBackground = false;
          },
        ),
      );
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    const answer = this.form.value.downloadTrainAndQuals;

    if (this.form.valid) {
      this.workerService.setDoYouWantToDownloadTrainAndQualsAnswer(answer);

      if (answer === 'Yes') {
        this.downloadAllCertificates().then(() =>
          this.router.navigate(this.nextRoute).then(() =>
            this.alertService.addAlert({
              type: 'success',
              message: "The training and qualifications summary has downloaded to your computer's Downloads folder",
            }),
          ),
        );
      } else if (answer === 'No') {
        this.router.navigate(this.nextRoute);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
