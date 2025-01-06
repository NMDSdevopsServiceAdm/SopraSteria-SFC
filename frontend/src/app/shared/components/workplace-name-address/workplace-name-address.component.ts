import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl: './workplace-name-address.component.html',
})
export class WorkplaceNameAddress implements OnInit {
  @Input() workplace: Establishment;
  @Input() canEditEstablishment: boolean;

  constructor() {}

  ngOnInit(): void {}
}
