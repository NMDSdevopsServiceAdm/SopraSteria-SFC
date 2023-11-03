import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentName: string;
  @Output() backToParentLinkClicked = new EventEmitter();

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.establishmentService.setIsSelectedWorkplace(false);
    this.backToParentLinkClicked.emit(event);
  }
}
