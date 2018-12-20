import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { EstablishmentServicesService } from '../../core/services/establishment-services.service';
import { LoginApiModel } from '../../core/model/loginApi.model';

@Component({
  selector: 'app-select-other-services',
  templateUrl: './select-other-services.component.html',
  styleUrls: ['./select-other-services.component.scss']
})
export class SelectOtherServicesComponent implements OnInit {

  mainService: string;
  isRegistered: boolean;

  constructor(
    private _eSService: EstablishmentServicesService,
    private router: Router,
    // private route: ActivatedRoute,
    private fb: FormBuilder) {}

  ngOnInit() {

    this.isRegistered = true;

    this.getAllServices(this.isRegistered);

    this.mainService = 'Example Service';
  }

  getAllServices(value) {

    this._eSService.getAllServices(value)
    .subscribe(
      (data: any) => {

        console.log(data);
        debugger;
          //this._eSService.updateState(data);

      },
      (err) => {
        debugger;
        console.log(err);
      },
      () => {
        console.log('Got all services for my establishment');
        //this.router.navigate(['/welcome']);
      }
    );

  }

}
