import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { fireEvent, render } from '@testing-library/angular';
import { AscWdsCertificateComponent } from './asc-wds-certificate.component';

describe('AscWdsCertificateComponent', () => {
  async function setup() {
    const { fixture, getByTestId, getByText, getByAltText } = await render(AscWdsCertificateComponent, {
      imports: [HttpClientTestingModule, RouterModule],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        provideRouter([]),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByAltText,
      getByTestId,
      getByText,
      routerSpy,
    };
  }

  it('should render an AscWdsCertificateComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Certificate Download Section', () => {
    const sectionTestId = 'certificateDownload';

    it('should render a certificate download section', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    });

    it('should render a sample image', async () => {
      const { getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    });
  });

  describe('Footer Download Section', () => {
    const sectionTestId = 'certificateDownload';

    it('should render a footer download section', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    });

    it('should render a footer image', async () => {
      const { getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    });
  });

  describe('Logo Download Section', () => {
    const sectionTestId = 'logoDownload';

    it('should render a logo download section', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    });

    it('should render a logo image', async () => {
      const { getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    });
  });

  describe('Return Button', () => {
    it('should navigate back to home tab', async () => {
      const { fixture, getByTestId } = await setup();
      const button = getByTestId('returnButton');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(button.getAttribute('href')).toEqual('/dashboard');
    });
  });

  describe('switch to the next year on April', async () => {
    beforeAll(() => {
      jasmine.clock().install();
    });

    afterAll(() => {
      jasmine.clock().uninstall();
    });

    it('should use year 2024/25 on 30 Mar 2025', async () => {
      jasmine.clock().mockDate(new Date('2025-03-30'));

      const { component } = await setup();

      expect(component.years).toEqual('24-25');
    });

    it('should use year 2025/26 on 01 Apr 2025', async () => {
      jasmine.clock().mockDate(new Date('2025-04-01'));

      const { component } = await setup();

      expect(component.years).toEqual('25-26');
    });

    it('should use year 2025/26 on 01 May 2025', async () => {
      jasmine.clock().mockDate(new Date('2025-05-01'));

      const { component } = await setup();

      expect(component.years).toEqual('25-26');
    });

    it('should use year 2026/27 on 01 Apr 2026', async () => {
      jasmine.clock().mockDate(new Date('2026-04-01'));

      const { component } = await setup();

      expect(component.years).toEqual('26-27');
    });
  });
});
