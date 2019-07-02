import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
})
export class ReportsHeaderComponent implements OnInit {
  @Input() title = 'Reports';

  public establishment: Establishment;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishmentService
      .getEstablishment(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(establishment => {
        this.establishment = establishment;
      });
  }
}
