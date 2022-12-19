import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { MandatoryTraining } from '@core/model/training.model';

@Component({
  selector: 'app-missing-mandatory-training',
  templateUrl: './missing-mandatory-training.component.html',
})
export class MissingMandatoryTrainingComponent implements OnInit {
  public workplace: Establishment;
  @Input() public missingRecord: MandatoryTraining;
  @Input() public training;
  @Input() public canEditWorker: boolean;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
  }
}
