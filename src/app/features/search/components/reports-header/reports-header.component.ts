import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
})
export class ReportsHeaderComponent implements OnInit {
  @Input() title = 'Reports';

  public establishment$: Observable<Establishment>;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishment$ = this.establishmentService.establishment$;
  }
}
