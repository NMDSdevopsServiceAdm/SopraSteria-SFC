import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { InsetTextComponent } from './inset-text.component';

describe('InsetTextComponent', () => {
  async function setup() {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      InsetTextComponent,
      {
        imports: [SharedModule],
        providers: [],
        componentProperties: {
          color: 'todo',
          closable: false,
        },
      },
    );

    const component = fixture.componentInstance;

    return {
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      fixture,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show close link', async () => {
    const { component, getByText, fixture, getByRole } = await setup();

    component.closable = true;
    fixture.detectChanges();

    expect(getByText('Close')).toBeTruthy();
    expect(getByRole('link', { name: /close/i })).toBeTruthy();
  });

  it('should show the link provided', async () => {
    const { component, getByText, fixture, getByRole } = await setup();

    const linkText = 'Cancel this';

    component.linkTextForAlert = linkText;
    fixture.detectChanges();

    expect(getByText(linkText)).toBeTruthy();
    expect(getByRole('link', { name: linkText })).toBeTruthy();
  });
});
