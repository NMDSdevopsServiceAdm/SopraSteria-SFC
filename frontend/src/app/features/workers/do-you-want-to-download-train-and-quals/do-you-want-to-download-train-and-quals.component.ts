import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-do-you-want-to-download-train-and-quals',
  templateUrl: './do-you-want-to-download-train-and-quals.component.html',
})
export class DoYouWantToDowloadTrainAndQualsComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  public ctaText = 'Continue';
  public exitText = 'Cancel';
  public returnUrl: URLStructure;
  public form: UntypedFormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    // private route: ActivatedRoute,
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
    private backLinkService: BackLinkService,
  ) {
    this.form = this.formBuilder.group({
      downloadTrainAndQuals: null,
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );
    this.setBackLink();
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.returnUrl = {
      url: ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'],
    };
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'delete-staff-record']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
