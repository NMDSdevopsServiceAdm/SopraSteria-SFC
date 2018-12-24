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
  obj;

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
      otherServiceSelected: ['']
    });

    this.isRegistered = true;

    this.getAllServices(this.isRegistered);
  }

  getAllServices(value) {

    this._eSService.getAllServices(value)
      .subscribe(
        (data: any) => {

          // Check if other services are already set
          this.checkIsServiceSet(data);

          this.servicesData = data;
          this.otherServicesData = data.allOtherServices;
          this.mainService = data.mainService.name;
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Got all services');
        }
      );

  }

  // Check if services exists and if so create services obj
  checkIsServiceSet(data) {

    data.otherServices.forEach(category => {
      category.services.forEach(service => {

        this.obj = {
          services: [{
            'id': service.id,
            'name': service.name
          }]
        };

        for (let i = 0; i < 1; i++) {
          this.postOtherServicesdata.push(this.obj.services[i]);
        }

      });
    });
  }

  toggleCheckbox($event: any) {
    if ($event.checked) {
      const $id = $event.id;
      const $name = $event.value;
      const $idToNum = parseInt($id);

      this.obj = {
        services: [{
          'id': $idToNum,
          'name': $name
        }]
      };

      for (let i = 0; i < this.obj.services.length; i++) {
        this.postOtherServicesdata.push(this.obj.services[i]);
      }
    }
    else {
      const $id = $event.id;
      const $idToNum = parseInt($id);

      for (let i = 0; i < this.postOtherServicesdata.length; i++) {
        if ($idToNum === this.postOtherServicesdata[i].id) {
          delete this.postOtherServicesdata[i];
        }
      }
    }
  }

  onSubmit() {

    if (this.postOtherServicesdata.length > 0) {
      this.save();
    }
    else {
      this.router.navigate(['/type-of-employer']);
    }
  }

  save() {
    this._eSService.postOtherServices(this.postOtherServicesdata)
      .subscribe(
        (data: any) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Successfully posted other services');
          this.router.navigate(['/type-of-employer']);
        }
      );
  }

}
