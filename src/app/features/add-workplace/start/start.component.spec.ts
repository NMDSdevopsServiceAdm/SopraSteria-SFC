import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartComponent } from './start.component';

describe('StartComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(StartComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        BackService,
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to regulated-by-cqc url in add-workplace flow when Continue button clicked', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toBe('/add-workplace/regulated-by-cqc');
  });

  describe('setBackLink()', () => {
    it('should set the correct back link', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/workplace', 'view-all-workplaces'],
      });
    });
  });
});
