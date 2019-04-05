import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
  styleUrls: ['./service-users.component.scss'],
})
export class ServiceUsersComponent implements OnInit, OnDestroy {
  public serviceUsersForm: FormGroup;
  public isInvalid: boolean;
  public serviceUsersData = [];
  public checkboxesSelected;
  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private router: Router, private establishmentService: EstablishmentService) {}

  get getServiceChecked() {
    return this.serviceUsersForm.get('serviceUserSelected');
  }

  ngOnInit() {
    this.serviceUsersForm = this.fb.group({
      serviceUserSelected: [''],
    });

    this.getAllServices();
    this.getCheckedUsers();
  }

  getAllServices() {
    this.subscriptions.add(
      this.establishmentService.getAllServiceUsers().subscribe((data: any) => {
        this.serviceUsersData = data;
      })
    );
  }

  getCheckedUsers() {
    this.checkboxesSelected = [];

    this.subscriptions.add(
      this.establishmentService.getServiceUsersChecked().subscribe((data: any) => {
        if (data.serviceUsers) {
          data.serviceUsers.forEach(thisServiceUser => {
            this.checkboxesSelected.push(thisServiceUser.id);
          });
        }
      })
    );
  }

  toggleCheckbox($event: any) {
    const serviceUserId = $event.value;

    if ($event.checked) {
      // add the serviceId to the known set of selected checkbox; but opnly if it
      //  doesn't already exist
      if (!this.checkboxesSelected.includes(serviceUserId)) {
        this.checkboxesSelected.push(parseInt(serviceUserId, 10));
      }
    } else {
      // remove the given service id
      const foundServiceIdIndex = this.checkboxesSelected.indexOf(parseInt(serviceUserId, 10));
      if (foundServiceIdIndex !== -1) {
        this.checkboxesSelected.splice(foundServiceIdIndex, 1);
      }
    }
  }

  async onSubmit() {
    const serviceUsersSelected = {
      serviceUsers: this.checkboxesSelected.map(thisValue => {
        return {
          id: parseInt(thisValue, 10),
        };
      }),
    };

    // always save back to backend API, even if there are (now) no other services
    this.subscriptions.add(
      this.establishmentService
        .postServiceUsers(serviceUsersSelected)
        .subscribe((data: any) => this.router.navigate(['/workplace', 'share-options']))
    );
  }

  goBack(event) {
    event.preventDefault();
    this.subscriptions.add(
      this.establishmentService.getCapacity(true).subscribe(res => {
        if (res.allServiceCapacities.length) {
          this.router.navigate(['/workplace', 'capacity-of-services']);
        } else {
          this.router.navigate(['/workplace', 'select-other-services']);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
