import { Component, OnInit, Input } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { EstablishmentServicesService } from '../../../core/services/establishment-services.service';
import { PostServicesModel } from '../../../core/model/postServices.model';
import { Services } from '@angular/core/src/view';

@Component({
  selector: 'app-select-other-services-list',
  templateUrl: './select-other-services-list.component.html',
  styleUrls: ['./select-other-services-list.component.scss']
})
export class SelectOtherServicesListComponent implements OnInit {
  mainService: string;
  isRegistered: boolean;
  servicesData: {};
  otherServicesData = {};
  SelectOtherServiceForm: FormGroup;
  isInvalid: boolean;
  checked: boolean;
  postOtherServicesdata: any = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _eSService: EstablishmentServicesService
  ) { }

  // Get user fullname
  get getServiceChecked() {
    return this.SelectOtherServiceForm.get('otherServiceSelected');
  }

  ngOnInit() {
    this.SelectOtherServiceForm = this.fb.group({
      otherServiceSelected: ''
    });

    this.isRegistered = true;

    this.getAllServices(this.isRegistered);
  }

  getAllServices(value) {

    this._eSService.getAllServices(value)
      .subscribe(
        (data: any) => {

          console.log(data);
          this.servicesData = data;
          this.otherServicesData = data.allOtherServices;
          this.mainService = data.mainService.name;

          //debugger;
        },
        (err) => {
          //debugger;
          console.log(err);
        },
        () => {
          console.log('Got all services');
        }
      );

  }

  onSubmit() {
    console.log('send');

    //getServiceChecked();
    if (this.postOtherServicesdata.length > 0) {
      debugger
      this.save();
    }
    else {
      debugger;
      this.router.navigate(['/type-of-employer']);
    }
  }

  save() {
    this._eSService.postOtherServices(this.postOtherServicesdata)
      .subscribe(
        (data: any) => {
          // debugger;
          console.log(data);
        },
        (err) => {
          // debugger;
          console.log(err);
        },
        () => {
          console.log('Successfully posted other services');
          this.router.navigate(['/type-of-employer']);
        }
      );
  }

  public toggleCheckbox($event: any) {
    // console.log($event);
    if ($event.checked) {
      const $id = $event.id;
      const $name = $event.value;

      //this.setPostObject($id, $name);

      const obj = {
        services: [{
          'id': $id,
          'name': $name
        }]
      };

      for (let i = 0; i < obj.services.length; i++) {
        this.postOtherServicesdata.push(obj.services[i]);
      }
      console.log(this.postOtherServicesdata);
    }
  }

}
