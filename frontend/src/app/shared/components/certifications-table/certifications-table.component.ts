import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-certifications-table',
  templateUrl: './certifications-table.component.html',
})
export class CertificationsTableComponent implements OnInit {
  @Input() certificates: any;

  ngOnInit() {}
}
