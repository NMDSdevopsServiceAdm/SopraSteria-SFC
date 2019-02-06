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
  otherServicesData = [];
  SelectOtherServiceForm: FormGroup;
  isInvalid: boolean;
  checked: boolean;
  obj;
  checkboxesSelected;

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
      otherServiceSelected: [''],
    });

    this.getAllServices();
  }

  getAllServices() {
    this.subscriptions.push(
    this._eSService.getAllServices()
      .subscribe(
        (data: any) => {
          this.otherServicesData = data.allOtherServices;
          this.mainService = data.mainService.name;

          this.checkboxesSelected = [];
          // otherServices is a grouped (by category) set of services - denormalise
          data.otherServices.forEach(thisServiceCategory => {
            thisServiceCategory.services.forEach(thisService => {
              this.checkboxesSelected.push(thisService.id);
            })
          })
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

  toggleCheckbox($event: any) {
    const eventId = $event.id;
    const serviceId = $event.value;

    if ($event.checked) {
      // add the serviceId to the known set of selected checkbox; but opnly if it
      //  doesn't already exist
      if (!this.checkboxesSelected.includes(serviceId)) {
        this.checkboxesSelected.push(parseInt(serviceId));
      }
    } else {
      // remove the given service id
      const foundServiceIdIndex = this.checkboxesSelected.indexOf(parseInt(serviceId));
      if (foundServiceIdIndex !== -1) this.checkboxesSelected.splice(foundServiceIdIndex, 1);
    }
  }

  async onSubmit() {
    const otherServicesSelected : PostServicesModel = {
      services: this.checkboxesSelected.map(thisValue => {
          return {
            id: parseInt(thisValue)
          }
        })
    }

    // always save back to backend API, even if there are (now) no other services
    this.subscriptions.push(
      this._eSService.postOtherServices(otherServicesSelected)
        .subscribe(
          (data: any) => {
            this.subscriptions.push(
              this._eSService.getCapacity(true).subscribe(c => {
                if (c.allServiceCapacities.length) {
                  this.router.navigate(['/capacity-of-services'])
                } else {
                  this.router.navigate(['/share-options'])
                }
              })
            )
          },
          (err) => {
            console.log(err);
          },
          () => {
            // Removing any navigation as 
          }
        )
    )  
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
