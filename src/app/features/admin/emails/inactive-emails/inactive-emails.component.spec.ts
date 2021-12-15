import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { SearchModule } from '@features/search/search.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { InactiveEmailsComponent } from './inactive-emails.component';

describe('InactiveEmailsComponent', () => {
  async function setup() {
    return render(InactiveEmailsComponent, {
      imports: [SharedModule, SearchModule, HttpClientTestingModule, RouterTestingModule],
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
                inactiveWorkplaces: { inactiveWorkplaces: 0 },
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

  describe('Inactive workplaces', () => {
    it('should create', async () => {
      const component = await setup();
      expect(component).toBeTruthy();
    });
  });
});
