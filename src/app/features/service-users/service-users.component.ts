import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
  styleUrls: ['./service-users.component.scss']
})
export class ServiceUsersComponent implements OnInit, OnDestroy {
  public serviceUsersForm: FormGroup;
  private isInvalid = false;
  public serviceUsersData = [];
  public checkboxesSelected;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _eSService: EstablishmentService
  ) { }

  get getServiceChecked() {
    return this.serviceUsersForm.get('serviceUserSelected');
  }

  ngOnInit() {
    this.serviceUsersForm = this.fb.group({
      serviceUserSelected: [''],
    });

    this.getAllServices();
  }

  getAllServices() {
    this.subscriptions.add(
      this._eSService.getAllServiceUsers()
        .subscribe(
          (data: any) => {
            debugger;
            this.serviceUsersData = data;

            this.checkboxesSelected = [];
            // otherServices is a grouped (by category) set of services - denormalise
            // data.serviceUsers.forEach(thisServiceCategory => {
            //   thisServiceCategory.forEach(thisServiceUser => {
            //     this.checkboxesSelected.push(thisServiceUser.id);
            //   });
            // });
          },
          (err) => {
            console.log(err);
          },
          () => {
          }
        )
    );
  }

  toggleCheckbox($event: any) {
    const eventId = $event.id;
    const serviceUserId = $event.value;

    if ($event.checked) {
      // add the serviceId to the known set of selected checkbox; but opnly if it
      //  doesn't already exist
      if (!this.checkboxesSelected.includes(serviceUserId)) {
        this.checkboxesSelected.push(parseInt(serviceUserId));
      }
    } else {
      // remove the given service id
      const foundServiceIdIndex = this.checkboxesSelected.indexOf(parseInt(serviceUserId));
      if (foundServiceIdIndex !== -1) {
        this.checkboxesSelected.splice(foundServiceIdIndex, 1);
      }
    }
  }

  async onSubmit() {
    const otherServicesSelected = {
      services: this.checkboxesSelected.map(thisValue => {
          return {
            id: parseInt(thisValue)
          }
        })
    }

    // always save back to backend API, even if there are (now) no other services
    // this.subscriptions.add(
    //   this._eSService.postOtherServices(otherServicesSelected)
    //     .subscribe(
    //       (data: any) => {
    //         this.subscriptions.add(
    //           this._eSService.getCapacity(true).subscribe(c => {
    //             if (c.allServiceCapacities.length) {
    //               this.router.navigate(['/capacity-of-services'])
    //             } else {
    //               this.router.navigate(['/share-options'])
    //             }
    //           })
    //         )
    //       },
    //       (err) => {
    //         console.log(err);
    //       },
    //       () => {
    //         // Removing any navigation as
    //       }
    //     )
    // );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
