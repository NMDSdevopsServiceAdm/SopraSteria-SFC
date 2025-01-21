import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl: './workplace-name-address.component.html',
  styleUrls: ['workplace-name-address.component.scss'],
})
export class WorkplaceNameAddress implements OnInit {
  @Input() workplace: Establishment;
  @Input() canEditEstablishment: boolean;
  @Input() return: URLStructure = null;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {}

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
  }
}
