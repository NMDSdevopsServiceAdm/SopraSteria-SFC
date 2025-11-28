import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
    selector: 'app-about-the-data-link',
    templateUrl: './about-the-data-link.component.html',
    standalone: false
})
export class AboutTheDataLinkComponent implements OnInit {
  public workplaceUid: string;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment?.uid;
  }
}
