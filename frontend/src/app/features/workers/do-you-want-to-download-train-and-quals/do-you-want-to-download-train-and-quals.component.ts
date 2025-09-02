import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

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

  constructor(
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
    private backLinkService: BackLinkService,
    private alertService: AlertService,
    private errorSummaryService: ErrorSummaryService,
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

  public onSubmit(): void {
    this.submitted = true;
    const answer = this.form.value.downloadTrainAndQuals;

    if (answer === 'Yes') {
      this.router.navigate(this.nextRoute).then(() =>
        this.alertService.addAlert({
          type: 'success',
          message: "The training and qualifications summary has downloaded to your computer's Downloads folder",
        }),
      );
    } else if (answer === 'No') {
      this.router.navigate(this.nextRoute);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
