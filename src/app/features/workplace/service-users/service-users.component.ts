import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { Question } from '@features/workplace/question/question.component';
import { logging } from 'selenium-webdriver';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
})

export class ServiceUsersComponent extends Question {
  public serviceGroups: ServiceGroup[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      serviceUsersForm: [[], null],
    });
  }

  protected init() {
    this.subscriptions.add(
      this.establishmentService.getAllServiceUsers().subscribe(serviceGroups => {
        this.serviceGroups = serviceGroups;
        this.serviceGroups.map(group => {
          group.services.map(service => {
            if (service.isMyService) {
              this.form.get('serviceUsersForm').value.push(service.id);
            }
          });
        });
      })
    );

    this.previous = ['/workplace', `${this.establishment.id}`, 'other-services'];
  }

  public toggle(target: HTMLInputElement) {
    const value = parseInt(target.value, 10);
    const selected = this.form.get('serviceUsersForm').value;

    if (target.checked) {
      if (!selected.includes(value)) {
        selected.push(value);
      }
    } else {
      const index = selected.indexOf(value);
      if (index >= 0) {
        selected.splice(index, 1);
      }
    }

    this.form.get('serviceUsersForm').setValue(selected);
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Other Services could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const { serviceUsersForm } = this.form.value;

    return {
      services: serviceUsersForm.map(id => {
        return { id };
      }),
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .getAllServiceUsers()
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.id, true).subscribe(
        response => {
          this.next = response.capacities.length
            ? ['/workplace', `${this.establishment.id}`, 'capacity-of-services']
            : ['/workplace', `${this.establishment.id}`, 'service-users'];
          this.navigate();
        },
        error => this.onError(error)
      )
    );
  }
}


// export class ServiceUsersComponent implements OnInit, OnDestroy {
//   public serviceUsersForm: FormGroup;
//   public isInvalid: boolean;
//   public serviceUsersData = [];
//   public checkboxesSelected;
//   private subscriptions: Subscription = new Subscription();
//
//   constructor(private fb: FormBuilder, private router: Router, private establishmentService: EstablishmentService) {}
//
//   get getServiceChecked() {
//     return this.serviceUsersForm.get('serviceUserSelected');
//   }
//
//   ngOnInit() {
//     this.serviceUsersForm = this.fb.group({
//       serviceUserSelected: [''],
//     });
//
//     this.getAllServices();
//     this.getCheckedUsers();
//   }
//
//   getAllServices() {
//     this.subscriptions.add(
//       this.establishmentService.getAllServiceUsers().subscribe((data: any) => {
//         this.serviceUsersData = data;
//       })
//     );
//   }
//
//   getCheckedUsers() {
//     this.checkboxesSelected = [];
//
//     this.subscriptions.add(
//       this.establishmentService.getServiceUsersChecked().subscribe((data: any) => {
//         if (data.serviceUsers) {
//           data.serviceUsers.forEach(thisServiceUser => {
//             this.checkboxesSelected.push(thisServiceUser.id);
//           });
//         }
//       })
//     );
//   }
//
//   toggleCheckbox($event: any) {
//     const serviceUserId = $event.value;
//
//     if ($event.checked) {
//       // add the serviceId to the known set of selected checkbox; but opnly if it
//       //  doesn't already exist
//       if (!this.checkboxesSelected.includes(serviceUserId)) {
//         this.checkboxesSelected.push(parseInt(serviceUserId, 10));
//       }
//     } else {
//       // remove the given service id
//       const foundServiceIdIndex = this.checkboxesSelected.indexOf(parseInt(serviceUserId, 10));
//       if (foundServiceIdIndex !== -1) {
//         this.checkboxesSelected.splice(foundServiceIdIndex, 1);
//       }
//     }
//   }
//
//   async onSubmit() {
//     const serviceUsersSelected = {
//       serviceUsers: this.checkboxesSelected.map(thisValue => {
//         return {
//           id: parseInt(thisValue, 10),
//         };
//       }),
//     };
//
//     // always save back to backend API, even if there are (now) no other services
//     this.subscriptions.add(
//       this.establishmentService
//         .postServiceUsers(serviceUsersSelected)
//         .subscribe((data: any) => this.router.navigate(['/workplace', 'sharing-data']))
//     );
//   }
//
//   goBack(event) {
//     event.preventDefault();
//     this.subscriptions.add(
//       this.establishmentService.getCapacity(true).subscribe(res => {
//         if (res.allServiceCapacities.length) {
//           this.router.navigate(['/workplace', 'capacity-of-services']);
//         } else {
//           this.router.navigate(['/workplace', 'other-services']);
//         }
//       })
//     );
//   }
//
//   ngOnDestroy() {
//     this.subscriptions.unsubscribe();
//   }
// }
