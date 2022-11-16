import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { allMandatoryTrainingCategories } from '@core/model/training.model';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-mandatory-training',
  templateUrl: './list-mandatory-training.component.html',
})
export class ListMandatoryTrainingComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;

  public existingMandatoryTrainings: allMandatoryTrainingCategories;
  constructor(public trainingService: TrainingService, private route: ActivatedRoute, public jobService: JobService) {}

  ngOnInit(): void {
    this.establishment = this.route.parent.snapshot.data.establishment;

    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((trainings) => {
        this.existingMandatoryTrainings = trainings;
      }),
    );
  }
}
