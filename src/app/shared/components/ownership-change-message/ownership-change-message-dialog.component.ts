import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Workplace } from '@core/model/my-workplaces.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ownership-change-message-dialog',
  templateUrl: './ownership-change-message-dialog.component.html',
})
export class OwnershipChangeMessageDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public workplace: Workplace;
  protected subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    public dialog: Dialog<OwnershipChangeMessageDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.workplace = this.data;
  }

  close(returnToClose: any) {
    this.dialog.close(returnToClose);
  }

  public ownershipChangeMessage($event: Event) {
    $event.preventDefault();
    this.close({ closeFrom: 'ownership-change' });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
