import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-and-manage-mandatory-training',
  templateUrl: './add-and-manage-mandatory-training.component.html',
})
export class AddAndManageMandatoryTrainingComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;

  public existingMandatoryTrainings: any;
  constructor(
    public trainingService: TrainingService,
    private route: ActivatedRoute,
    public jobService: JobService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    public establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MANDATORY_TRAINING);
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((trainings) => {
        this.existingMandatoryTrainings = trainings;
      }),
    );
  }

  public navigateToAddNewMandatoryTraining() {
    this.router.navigate([
      '/workplace',
      this.establishmentService.primaryWorkplace.uid,
      'add-and-manage-mandatory-training',
      'add-new-mandatory-training',
    ]);
  }
}
