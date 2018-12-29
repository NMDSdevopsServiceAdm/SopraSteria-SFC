import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms"
import { Router } from "@angular/router"

import { MessageService } from "../../core/services/message.service"
import { EstablishmentService } from "../../core/services/establishment.service"
import { LocalAuthorityService } from "../../core/services/localAuthority.service"

import { SharingOptionsModel } from '../../core/model/sharingOptions.model';
import { LocalAuthorityModel } from '../../core/model/localAuthority.model';


@Component({
  selector: 'app-shareLocalAuthority',
  templateUrl: './shareLocalAuthority.component.html',
  styleUrls: ['./shareLocalAuthority.component.scss']
})
export class ShareLocalAuthorityComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private localAuthorityService: LocalAuthorityService,
    private messageService: MessageService,
    private fb: FormBuilder) {

  }

  private shareLocalAuthoritiesForm: FormGroup
  private subscriptions = []

  private _isSharingWithLAEnabled: boolean = false;
  private _allAuthorities: LocalAuthorityModel[] = [];
  private _localAuthorities: LocalAuthorityModel[] = [];
  private _primaryAuthority: LocalAuthorityModel = null;

  // form controls
  get primaryAuthorityControl() {
    return this.shareLocalAuthoritiesForm.get('primaryAuthorityCtl').value
  }
  set primaryAuthorityControl(value:boolean) {
    console.log("Updating primary authority control: ", value);
    this.shareLocalAuthoritiesForm.get('primaryAuthorityCtl').patchValue(true, {onlySelf:true, emitEvent: false});
  }
  get doNotShareControl(): boolean {
    return this.shareLocalAuthoritiesForm.get('doNotShareCtl').value;
  }
  get doShareControl(): boolean {
    return this.shareLocalAuthoritiesForm.get('doShareCtl').value;
  }
  get authoritiesControl() : FormArray {
    return <FormArray> this.shareLocalAuthoritiesForm.controls.authoritiesCtl;
  }

  // component state
  get isSharingEnabled(): boolean {
    return this._isSharingWithLAEnabled;
  }
  get primaryAuthority(): LocalAuthorityModel {
    return this._primaryAuthority;
  }
  get primaryAuthorityName(): string {
    if (this._primaryAuthority) return this._primaryAuthority.name;
    return 'Rendering....';
  }
  get localAuthorities(): LocalAuthorityModel[] {
    return this._localAuthorities;
  }
  get allAuthorties(): LocalAuthorityModel[] {
    return this._allAuthorities;
  }

  get hasLocalAuthorities(): boolean {
    if (this._localAuthorities) {
      if (this._localAuthorities.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // helpers
  sameLocalAuthority(givenLA:LocalAuthorityModel, referenceLA:LocalAuthorityModel): boolean {
    if (givenLA.custodianCode === referenceLA.custodianCode) {
      return true;
    } else {
      return false;
    }
  }

  // adds a new uninitialised authority
  addAuthority() {
    this.authoritiesControl.push(this._createAuthorityControl());
  }

  // removes the Authority with given index
  removeAuthority(index) {
    this.authoritiesControl.removeAt(index);
  }

  private _createAuthorityControl(custodianCode=null) {
    return this.fb.group({
      custodianCode: [custodianCode, Validators.required]
    });
  }

  onSubmit () {
    alert("onSubmit)")
    if (this.doNotShareControl) {
      alert("Navigate to share options")
      //this.router.navigate(["/shareOptions"]);
    } else {
      alert("Process selected authorities")
      // get the list of authorities from the form array, but filter
      //   the default option (whereby custodian code is null), and
      //   to remap each entry. Note, the source and target are
      //   the same structure but preferred to map here anyway
      //   to make it explicit for posting
      // const selectedAuthorites = [];
      const authorityCtlValues = this.authoritiesControl.value;

      const selectedAuthorites = this.authoritiesControl.value
          .filter(a => a.custodianCode === null ? false : true)
          .map(a => { return { custodianCode: parseInt(a.custodianCode) }});

      // now check if the primary authority has also been selected, and if so
      //  add that to the set of selected authorities
      if (this.primaryAuthorityControl) {
        selectedAuthorites.push({
          custodianCode: this._primaryAuthority.custodianCode
        });
      }

      // // for test/debugging
      // selectedAuthorites.forEach(thisAuth => {
      //   console.log("this auth: ", thisAuth)
      // });

      this.subscriptions.push(
        this.establishmentService.postLocalAuthorities(selectedAuthorites)
          .subscribe(() => {
            this.router.navigate(['/vacancies']);
          }));
    }

  }

  ngOnInit() {
    // create form controls, including an empty array for the list of authorities
    this.shareLocalAuthoritiesForm = this.fb.group({
      primaryAuthorityCtl: [false, [Validators.required]],
      doNotShareCtl: [false, [Validators.required]],
      authoritiesCtl: this.fb.array([])
    });

    // temporarily enable sharing
    this._isSharingWithLAEnabled = true;

    // fetch establishment sharing options to determine if Local Authority sharing is enable.
    this.subscriptions.push(
      this.establishmentService.getSharingOptions().subscribe(options => {
        // for this component to be relevant, sharing must be enabled and
        //   must be sharing with Local Authority
        this._isSharingWithLAEnabled = options.share.enabled && options.share.with.includes('Local Authority');
      })
    );

    // when initialising this component, get the set of all Local Authorities (for drop down)
    this.subscriptions.push(
      this.localAuthorityService.getAuthorities().subscribe(authorities => {
        this._allAuthorities = authorities;
      })
    );

    // and get the current establishment local authorities configuration
    this.subscriptions.push(
      this.establishmentService.getLocalAuthorities().subscribe(authorities => {
        this._primaryAuthority = authorities.primaryAuthority;
        this._localAuthorities = authorities.localAuthorities;

        // create the set of authority form controls for each local authority
        const ourAuthoritiesControl = this.authoritiesControl;
        if (this._localAuthorities && this._localAuthorities.length > 0) {
          this._localAuthorities.forEach(thisAuthority => {
            // one of the fetched (API) authorities could be the primary authority
            if (thisAuthority.isPrimaryAuthority) {
              console.log("The primary authority is checked: ", thisAuthority.custodianCode);
              this.primaryAuthorityControl = true;
            } else {
              ourAuthoritiesControl.push(this._createAuthorityControl(thisAuthority.custodianCode));
            }
            
          });
        }
        
        //console.log("Getting primary authority by name: ", this.primaryAuthorityName)
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.messageService.clearAll()
  }
}
