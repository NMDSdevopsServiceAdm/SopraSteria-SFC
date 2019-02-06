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
      otherServiceSelected: [''],
    });

    this.getAllServices();

    // build the 
  }

  getAllServices() {
    this.subscriptions.push(
    this._eSService.getAllServices()
      .subscribe(
        (data: any) => {
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


  async onSubmit() {
    let selectedValues = this.SelectOtherServiceForm.get('otherServiceSelected').value

    // TODO - expecting selectedValues to be an array
    selectedValues = [
      selectedValues
    ];
    const otherServicesSelected : PostServicesModel = {
      services: selectedValues.map(thisValue => {
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
                console.log("WA DEBUG: capacities returned after updating other servcies: ", c)
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
