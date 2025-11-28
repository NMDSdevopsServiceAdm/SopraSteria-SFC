import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    standalone: false
})
export class DetailsComponent {
  @Input() title: string;
}
