import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wdf-field-confirmation',
  templateUrl: './wdf-field-confirmation.component.html',
})
export class WdfFieldConfirmationComponent {
  public confirmButtonClicked = false;
  private _workerUid: string = null;

  @Output() fieldConfirmation: EventEmitter<Event> = new EventEmitter();
  @Output() setReturnClicked: EventEmitter<Event> = new EventEmitter();
  @Input() changeLink: any[];

  @Input() set workerUid(uid: string) {
    this._workerUid = uid;
    this.resetConfirmButtonClicked();
  }

  get workerUid(): string {
    return this._workerUid;
  }

  public confirmField(): void {
    this.fieldConfirmation.emit();
    this.confirmButtonClicked = true;
  }

  public resetConfirmButtonClicked(): void {
    this.confirmButtonClicked = false;
  }

  public setReturn(): void {
    this.setReturnClicked.emit();
    this.confirmButtonClicked = true;
  }
}
