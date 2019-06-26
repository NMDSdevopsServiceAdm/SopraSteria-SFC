import { Establishment } from './../../../core/model/establishment.model';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-view-workplace',
  templateUrl: './view-workplace.component.html',
})
export class ViewWorkplaceComponent implements OnInit {
  // public returnToRecord: URLStructure;
  public workPlace: Establishment;

  constructor(
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.establishmentService.establishment$.pipe(
      take(1)
    ).subscribe(establishment => {
      this.workPlace = establishment;

      // this.returnToRecord = { url: ['/worker', this.worker.uid], fragment: 'staff-record' };
      // this.returnToQuals = { url: ['/worker', this.worker.uid], fragment: 'qualifications-and-training' };
    });
  }


  setDate(): any {
    throw new Error('Method not implemented.');
  }
}
