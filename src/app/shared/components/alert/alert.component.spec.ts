import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  const setup = async () => {
    const { fixture } = await render(AlertComponent, {
      imports: [SharedModule],
      providers: [AlertService, WindowRef],
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
