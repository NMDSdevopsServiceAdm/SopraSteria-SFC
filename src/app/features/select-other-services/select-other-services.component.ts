import { Component, OnInit, OnDestroy } from '@angular/core';

import { Services } from '@angular/core/src/view';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';

import { EstablishmentService } from '../../core/services/establishment.service';
import { LoginApiModel } from '../../core/model/loginApi.model';
import { PostServicesModel } from '../../core/model/postServices.model';

// Implementation moved from select-other-services
@Component({
  selector: 'app-select-other-services',
  templateUrl: './select-other-services.component.html',
  styleUrls: ['./select-other-services.component.scss']
})
export class SelectOtherServicesComponent implements OnInit, OnDestroy {
  mainService: string;
  isRegistered: boolean;
  servicesData: {};
  otherServicesData = [];
  SelectOtherServiceForm: FormGroup;
  isInvalid: boolean;
  checked: boolean;
  postOtherServicesdata: any = [];
  obj;

  private subscriptions = []

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _eSService: EstablishmentService
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

    this.getAllServices();
  }

  getAllServices() {
    this.subscriptions.push(
    this._eSService.getAllServices()
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
      )
    )
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

        this.obj.services.forEach(thisService => {
          this.postOtherServicesdata.push(thisService);
        });
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

  async onSubmit() {
    try {
      await this.save()

      this.subscriptions.push(
        this._eSService.getCapacity(true).subscribe(c => {
          if (c.allServiceCapacities.length) {
            this.router.navigate(['/capacity-of-services'])

          } else {
            this.router.navigate(['/share-options'])
          }
        })
      )
    } catch (e) {
      // keep the JS transpiler silent about lack of rejected path
    }
  }

  save() {
    return new Promise((resolve, reject) => {
    this.subscriptions.push(
    this._eSService.postOtherServices(this.postOtherServicesdata)
      .subscribe(
        (data: any) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
          reject(err)
        },
        resolve
      )
    )
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
