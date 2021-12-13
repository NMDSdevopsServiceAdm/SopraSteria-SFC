import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { TargetedEmailsComponent } from './targeted-emails.component';

describe('EmailsComponent', () => {
  async function setup() {
    return render(TargetedEmailsComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                emailCampaignHistory: [],
                emailTemplates: {
                  templates: [],
                },
              },
            },
          },
        },
      ],
    });
  }
});
