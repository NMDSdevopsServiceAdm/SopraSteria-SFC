import { Component, OnInit } from '@angular/core';
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
})
export class RemoveAllMandatoryTrainingComponent implements OnInit {
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
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public deleteMandatoryTraining(): void {
    this.subscriptions.add(
      this.trainingService.deleteAllMandatoryTraining(this.establishment.id).subscribe(() => {
        this.router.navigate([
          '/workplace',
          this.establishmentService.primaryWorkplace.uid,
          'add-and-manage-mandatory-training',
        ]);
        this.alertService.addAlert({
          type: 'success',
          message: 'All mandatory training categories removed',
        });
      }),
    );
  }

  public navigateToPreviousPage(): void {
    this.router.navigate([
      '/workplace',
      this.establishmentService.primaryWorkplace.uid,
      'add-and-manage-mandatory-training',
    ]);
  }
}
