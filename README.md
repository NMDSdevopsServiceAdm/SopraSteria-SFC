# NgSfcV2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.3.

## Development server
1. Run `npm run server` for a dev server. This will compile the assets using `npm run build:watch` and also start the Express app using `npm run server`.
2. Navigate to `http://localhost:8080/` to view the application

#### Note: ####
Any FE changes should re-compile the assets and refresh the browser automatically.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Database connection parameters can be overridden using environment variables:
* `DB_HOST` - hostname or IP address
* `DB_PORT` - port number
* `DB_NAME` - name of database
* `DB_USER` - database username
* `DB_PASS` - database password

# Accessibility

1. Ensure all images have a contextual and useful `alt` tag. If no context is needed, use `alt=""`.
2. Ensure that content follows semantic markup, for instance using definition lists, labels and fieldsets.
3. Anchors with `target="_blank"` require `<span class="govuk-visually-hidden"> (opens in a new window)</span>` to be placed after the text content and before the closing anchor tag.
4. All Angular Directives must be wrapped in square brackets `[]`.
5. Dialogs `h1` element should contain the id `id="dialogHeading"`.
6. Download links must contain a valid `href` containing the filename.
