import { SharedModule } from '@shared/shared.module';
import { getByText, render } from '@testing-library/angular';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { BackToParentComponent } from './back-to-parent-link.component';

describe('BackToParentComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BackToParentComponent, {
      imports: [SharedModule],
      providers: [AlertService, WindowRef],
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

    component.primaryWorkplaceName = 'Test parent';
    fixture.detectChanges();

    const linkText = getByText('Back to Test parent');
    expect(linkText).toBeTruthy();
  });

  it('should emit on click', async () => {
    const { component, fixture, getByText } = await setup();

    component.primaryWorkplaceName = 'Test parent';
    fixture.detectChanges();

    const linkText = getByText('Back to Test parent');
    const backToParentLinkClickEmitter = spyOn(component.backToParentLinkClicked, 'emit');

    linkText.click();
    expect(backToParentLinkClickEmitter).toHaveBeenCalled();
  });
});
