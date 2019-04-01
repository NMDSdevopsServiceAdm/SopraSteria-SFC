import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PostServicesModel } from '@core/model/postServices.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-other-services',
  templateUrl: './select-other-services.component.html',
})
export class SelectOtherServicesComponent implements OnInit, OnDestroy {
  mainService: string;
  otherServicesData = [];
  SelectOtherServiceForm: FormGroup;
  isInvalid: boolean;
  checked: boolean;
  obj;
  checkboxesSelected;

  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private router: Router, private establishmentService: EstablishmentService) {}

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
    this.subscriptions.add(
      this.establishmentService.getAllServices().subscribe((data: any) => {
        this.otherServicesData = data.allOtherServices;
        this.mainService = data.mainService.name;

        this.checkboxesSelected = [];
        // otherServices is a grouped (by category) set of services - denormalise
        if (data.otherServices) {
          data.otherServices.forEach(thisServiceCategory => {
            thisServiceCategory.services.forEach(thisService => {
              this.checkboxesSelected.push(thisService.id);
            });
          });
        }
      })
    );
  }

  toggleCheckbox($event: any) {
    const serviceId = $event.value;

    if ($event.checked) {
      // add the serviceId to the known set of selected checkbox; but opnly if it
      //  doesn't already exist
      if (!this.checkboxesSelected.includes(serviceId)) {
        this.checkboxesSelected.push(parseInt(serviceId, 10));
      }
    } else {
      // remove the given service id
      const foundServiceIdIndex = this.checkboxesSelected.indexOf(parseInt(serviceId, 10));
      if (foundServiceIdIndex !== -1) {
        this.checkboxesSelected.splice(foundServiceIdIndex, 1);
      }
    }
  }

  async onSubmit() {
    const otherServicesSelected: PostServicesModel = {
      services: this.checkboxesSelected.map(thisValue => {
        return {
          id: parseInt(thisValue, 10),
        };
      }),
    };

    // always save back to backend API, even if there are (now) no other services
    this.subscriptions.add(
      this.establishmentService.postOtherServices(otherServicesSelected).subscribe((data: any) => {
        this.subscriptions.add(
          this.establishmentService.getCapacity(true).subscribe(c => {
            if (c.allServiceCapacities.length) {
              this.router.navigate(['/workplace', 'capacity-of-services']);
            } else {
              this.router.navigate(['/service-users']);
            }
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
