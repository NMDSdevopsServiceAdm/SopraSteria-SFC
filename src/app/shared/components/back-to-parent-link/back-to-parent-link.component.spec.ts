import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { WindowRef } from '@core/services/window.ref';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BackToParentComponent } from './back-to-parent-link.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BackToParentComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BackToParentComponent, {
      imports: [SharedModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the parent name', async () => {
    const { component, fixture, getByText } = await setup();

    component.parentName = 'Test parent';
    fixture.detectChanges();

    const linkText = getByText('Back to Test parent');
    expect(linkText).toBeTruthy();
  });

  it('should emit on click', async () => {
    const { component, fixture, getByText } = await setup();

    component.parentName = 'Test parent';
    fixture.detectChanges();

    const linkText = getByText('Back to Test parent');
    const backToParentLinkClickEmitter = spyOn(component.backToParentLinkClicked, 'emit');

    linkText.click();
    expect(backToParentLinkClickEmitter).toHaveBeenCalled();
  });
});
