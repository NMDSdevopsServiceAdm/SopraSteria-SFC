import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-select-other-services-list',
  templateUrl: './select-other-services-list.component.html',
  styleUrls: ['./select-other-services-list.component.scss']
})
export class SelectOtherServicesListComponent implements OnInit {
  @Input() mainService: string;

  constructor() { }

  ngOnInit() {
  }

}
