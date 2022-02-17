import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent implements OnInit {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction = 'Save and continue';
  @Input() recordSummary = true;
  @Input() canExit = true;
  @Input() exitText = 'Exit';
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  isStaffRecord = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.router.url.includes('staff-record')) this.isStaffRecord = true;
  }

  onClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }
}
