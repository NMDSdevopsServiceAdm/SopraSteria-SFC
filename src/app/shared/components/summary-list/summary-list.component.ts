import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryList } from '@core/model/summary-list.model';

@Component({
  selector: 'app-summary-list',
  templateUrl: './summary-list.component.html',
})
export class SummaryListComponent {
  @Input() public summaryList: SummaryList[];
  @Input() public topBorder?: boolean;
  @Input() public wrapBorder?: boolean;
  @Input() public canNavigate?: boolean;
  @Input() public displayShowPasswordToggle = false;
  @Output() public setReturn = new EventEmitter();
  public showPassword: boolean;

  public emitSetReturn(): void {
    this.setReturn.emit();
  }

  public togglePassword(event: Event): void {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }
}
