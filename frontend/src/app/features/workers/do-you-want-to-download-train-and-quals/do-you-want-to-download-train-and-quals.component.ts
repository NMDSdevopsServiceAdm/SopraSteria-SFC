import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCertificateService, QualificationCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PdfMakeService } from '@core/services/pdf-make.service';
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
  public qualificationsByGroup: QualificationsByGroup;
  private trainingRecords: TrainingRecords;
  public lastUpdatedDate: Date;
  public nonMandatoryTraining: TrainingRecordCategory[];
  public mandatoryTraining: TrainingRecordCategory[];

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
    private pdfMakeService: PdfMakeService,
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
    this.worker = this.route.snapshot.data.worker;
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;

    this.mandatoryTraining = this.trainingRecords.mandatory;
    this.nonMandatoryTraining = this.trainingRecords.nonMandatory;

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

  public async downloadTrainingAndQualsPdfWhenDeleteStaff() {
    try {
      this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, this.trainingRecords?.lastUpdated]);

      return this.pdfMakeService.generateTrainingAndQualifications(
        this.workplace,
        this.mandatoryTraining,
        this.nonMandatoryTraining,
        this.qualificationsByGroup,
        this.worker,
        this.lastUpdatedDate,
      );
    } catch (error) {
      console.error(error);
    }
  }

  public getLastUpdatedDate(lastUpdatedDates: Date[]): void {
    const filteredDates = lastUpdatedDates.filter((date) => date);
    this.lastUpdatedDate = filteredDates.reduce((a, b) => (a > b ? a : b), null);
  }
  public onSubmit(): void {
    this.submitted = true;
    const answer = this.form.value.downloadTrainAndQuals;

    if (this.form.valid) {
      this.workerService.setDoYouWantToDownloadTrainAndQualsAnswer(answer);

      if (answer === 'Yes') {
        this.downloadAllCertificates()
          .then(() => {
            return this.downloadTrainingAndQualsPdfWhenDeleteStaff();
          })
          .then(() => {
            return this.router.navigate(this.nextRoute);
          })
          .then(() =>
            this.alertService.addAlert({
              type: 'success',
              message: "The training and qualifications summary has downloaded to your computer's Downloads folder",
            }),
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
