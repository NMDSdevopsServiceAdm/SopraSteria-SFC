import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: 'worker-save-success.component.html',
})
export class WorkerSaveSuccessComponent {
  public return: { url: any[]; label: string };

  constructor(private route: ActivatedRoute) {
    const workplaceUid = this.route.snapshot.paramMap.get('establishmentuid');
    const primaryWorkplaceUid = this.route.parent.snapshot.data.primaryWorkplace
      ? this.route.parent.snapshot.data.primaryWorkplace.uid
      : null;

    this.return =
      workplaceUid === primaryWorkplaceUid
        ? { url: ['/dashboard'], label: 'dashboard' }
        : { url: ['/workplace', workplaceUid], label: 'workplace' };
  }
}
