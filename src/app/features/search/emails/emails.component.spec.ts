import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { EmailsComponent } from './emails.component';

describe('EmailsComponent', () => {
  async function setup() {
    return render(EmailsComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                emailCampaignHistory: [],
                inactiveWorkplaces: { inactiveWorkplaces: 10 },
              },
            },
          },
        },
        DialogService,
        EmailCampaignService,
        AlertService,
        DecimalPipe,
        HttpClient,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
