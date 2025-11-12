import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
    selector: 'app-display-workplace-name-address',
    templateUrl: './display-workplace-name-address.component.html',
    styleUrls: ['display-workplace-name-address.component.scss'],
    standalone: false
})
export class DisplayWorkplaceNameAddress implements OnInit {
  @Input() workplace: Establishment;
  @Input() canEditEstablishment: boolean;
  @Input() return: URLStructure = null;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {}

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
  }
}
