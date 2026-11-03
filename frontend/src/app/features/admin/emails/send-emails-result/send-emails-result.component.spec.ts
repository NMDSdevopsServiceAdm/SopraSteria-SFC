import { of } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AdminModule } from '@features/admin/admin.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SendEmailsResultComponent } from './send-emails-result.component';

describe('SendEmailsResultComponent', () => {
  beforeAll(() => {
    jasmine.clock().install();
  });
  afterAll(() => {
    jasmine.clock().uninstall();
  });

  const mockSendEmailsResult = {
    timestamp: '2026-09-21T10:07:21.139Z',
    date: '2026-09-21',
    successful: [
      {
        result: 'failed',
        templateId: 1,
        to: {
          name: 'test',
          email: 'test@example.com',
        },
        messageId: 'mock-id-1',
        timestamp: '2026-09-21T09:41:41.985Z',
      },
      {
        result: 'failed',
        templateId: 1,
        to: {
          name: 'test',
          email: 'test@example.com',
        },
        messageId: 'mock-id-2',
        timestamp: '2026-09-21T09:41:41.987Z',
      },
    ],
    failed: [
      {
        result: 'failed',
        templateId: 1,
        to: {
          name: 'test',
          email: 'test@example.com',
        },
        messageId: 'mock-id-3',
        timestamp: '2026-09-21T09:41:41.989Z',
      },
    ],
    successfulCount: 2,
    failedCount: 1,
    todayTotalCount: 3,
  };

  async function setup() {
    const getSendEmailsResultSpy = jasmine.createSpy().and.returnValue(of(mockSendEmailsResult));

    const setupTools = await render(SendEmailsResultComponent, {
      imports: [SharedModule, AdminModule],
      providers: [
        { provide: EmailCampaignService, useValue: { getSendEmailsResult: getSendEmailsResultSpy } },
        DecimalPipe,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;
    return { ...setupTools, component, getSendEmailsResultSpy };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the send email results', async () => {
    const { getByText, fixture } = await setup();

    jasmine.clock().tick(1);
    fixture.detectChanges();

    expect(getByText('Number of emails scheduled to send today:')).toBeTruthy();
    expect(getByText('Number of emails scheduled to send today:').nextElementSibling?.textContent).toContain('3');

    expect(getByText('Reached Brevo service:')).toBeTruthy();
    expect(getByText('Reached Brevo service:').nextElementSibling?.textContent).toContain('2');

    expect(getByText('Failed to sent:')).toBeTruthy();
    expect(getByText('Failed to sent:').nextElementSibling?.textContent).toContain('1');
  });

  it('should auto update the result', async () => {
    const { getSendEmailsResultSpy, fixture, getByText } = await setup();

    jasmine.clock().tick(1);
    fixture.detectChanges();

    expect(getByText('Number of emails scheduled to send today:').nextElementSibling?.textContent).toContain('3');

    const updatedResult = { ...mockSendEmailsResult, successfulCount: 4, failedCount: 2, todayTotalCount: 7 };
    getSendEmailsResultSpy.and.returnValue(of(updatedResult));
    jasmine.clock().tick(60001); // after 1 minute
    fixture.detectChanges();

    expect(getByText('Number of emails scheduled to send today:').nextElementSibling?.textContent).toContain('7');
    expect(getByText('Reached Brevo service:').nextElementSibling?.textContent).toContain('4');
    expect(getByText('Failed to sent:').nextElementSibling?.textContent).toContain('2');
  });
});
