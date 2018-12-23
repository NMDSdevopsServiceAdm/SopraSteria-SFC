import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';

import { EstablishmentServicesService } from '../../core/services/establishment-services.service';
import { LoginApiModel } from '../../core/model/loginApi.model';

@Component({
  selector: 'app-select-other-services',
  templateUrl: './select-other-services.component.html',
  styleUrls: ['./select-other-services.component.scss']
})
export class SelectOtherServicesComponent implements OnInit {

  mainService: string;

  servicesData: object;

  constructor(
    private _eSService: EstablishmentServicesService,
    private router: Router,
    // private route: ActivatedRoute,
    ) {}

  ngOnInit() {



    this.mainService = 'Example Service';
  }



}
