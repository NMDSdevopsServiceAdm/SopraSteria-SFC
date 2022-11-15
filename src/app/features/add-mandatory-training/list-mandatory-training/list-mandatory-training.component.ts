import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { allMandatoryTrainingCategories, Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-mandatory-training',
  templateUrl: './list-mandatory-training.component.html',
})
export class ListMandatoryTrainingComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;

  public existingMandatoryTrainings: allMandatoryTrainingCategories;
  constructor(public establishmentService: EstablishmentService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.establishment = this.route.parent.snapshot.data.establishment;

    this.subscriptions.add(
      this.establishmentService.getAllMandatoryTrainings(this.establishment.uid).subscribe((trainings) => {
        console.log({ trainings });

        this.existingMandatoryTrainings = trainings;
      }),
    );
  }
}
