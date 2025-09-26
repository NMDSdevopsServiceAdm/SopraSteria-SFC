import { Component, Input } from '@angular/core';

enum Status {
  Success = 'success',
  Error = 'error',
  Fail = 'fail',
}

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss'],
    standalone: false
})
export class StatusComponent {
  @Input() title: string;
  @Input() status: Status = Status.Success;
}
