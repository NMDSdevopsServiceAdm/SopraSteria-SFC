import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-remove-all-selections-dialog',
    templateUrl: './delete-all-mandatory-training.component.html',
    standalone: false
})
export class RemoveAllMandatoryTrainingComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected backLinkService: BackLinkService,
    private trainingService: TrainingService,
    private route: ActivatedRoute,
    protected router: Router,
    private alertService: AlertService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.backLinkService.showBackLink();
  }

  public deleteMandatoryTraining(): void {
    this.subscriptions.add(
      this.trainingService.deleteAllMandatoryTraining(this.establishment.id).subscribe(() => {
        this.navigateToPreviousPage().then(() => {
          this.alertService.addAlert({
            type: 'success',
            message: 'All mandatory training categories removed',
          });
        });
      }),
    );
  }

  public navigateToPreviousPage(): Promise<boolean> {
    return this.router.navigate(['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
