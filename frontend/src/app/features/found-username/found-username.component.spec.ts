import { render } from '@testing-library/angular';
import { FoundUsernameComponent } from './found-username.component';

fdescribe('FoundUsernameComponent', () => {
  const setup = async () => {
    const setupTools = await render(FoundUsernameComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {},
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
