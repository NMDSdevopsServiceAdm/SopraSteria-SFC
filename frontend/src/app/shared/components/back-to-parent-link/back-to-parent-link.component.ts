import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() primaryWorkplaceName: string;
  @Output() backToParentLinkClicked = new EventEmitter();

  constructor(private establishmentService: EstablishmentService, private route: Router) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.route.navigate(['dashboard']);
    this.backToParentLinkClicked.emit(event);
  }
}
