import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-pill-with-link',
  templateUrl: './new-pill-with-link.component.html',
  styleUrls: ['./new-pill-with-link.component.scss'],
  standalone: false,
})
export class NewPillWithLinkComponent implements OnInit {

  @Input() showNewPill: boolean = false

  constructor() {}

  ngOnInit(): void {}
}
