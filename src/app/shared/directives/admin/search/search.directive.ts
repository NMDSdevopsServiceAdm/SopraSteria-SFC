import { Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { Subscription } from 'rxjs';

@Directive()
export class SearchDirective implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public searchDetails = [];
  public searchDetailsLabel = [];
  protected subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: FormBuilder,
    protected searchService: SearchService,
    protected switchWorkplaceService: SwitchWorkplaceService,
    protected alertService: AlertService,
    protected dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.setupForm();
  }

  protected setupForm(): void {}

  protected onSubmit(): void {}

  protected changeStatus(username: string, index: number, event: Event): void {}

  protected errorMessage(): void {
    this.alertService.addAlert({
      type: 'warning',
      message: 'There was a problem making this request',
    });
  }

  protected navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  protected toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.searchDetails[uid] = !this.searchDetails[uid];
    this.searchDetailsLabel[uid] = this.searchDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
