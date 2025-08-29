# Skills for Care - Adult Social Care Workforce Data Set

This repository contains the web application code for Skill for Care's Adult Social Care Workforce Data Set (ASC-WDS) service.
Currently the application is running with [Angular](https://angular.dev/) version 17 as frontend and [Express](https://expressjs.com/) as backend.


## Development server
1. Run `make run` for a dev server. This will start the Angular frontend by `npm run build:watch` and also start the backend Express app using `npm run new-start`
2. Navigate to `http://localhost:8080/` to view the application

#### Note:
Any frontend file changes will re-compile the assets and refresh the browser automatically.

## Code scaffolding

First, pick a sub-directory under `frontend` where we want to create the files, for example `frontend/src/app/shared/components` where we store the shared component.
Then, `cd` into the chosen sub-directory and run `ng generate component component-name` to generate a new component.
You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module` to generate other Angular items.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

### Frontend
Run `make test-fe` to execute the unit tests for the frontend.
The test runner will watch the source files and automatically re-run all tests whenever a frontend file is modified.

To run only one or a few specific tests, open the relevant `.spec.ts` file and modify the `describe` block to `fdescribe`. This will let the test runner to focus on the chosen tests and skip all others.

Also, after running all tests, the test runner will dump the results at `frontend/TESTS.xml`.
If in case multiple tests are failing, we can check the file to find out which tests are the failed ones.

### Backend
Run `make test-be` to execute the unit tests for the backend.
This test runner does not watch file changes, so re-run the test manually if necessary.

To focus on specific tests, modify the `describe` block to `describe.only`, then run the tests again.

### Bulk upload lambda
Run `make test-bu` to execute the unit tests for bulk upload lambda.


## Running end-to-end tests

We run our end-to-end tests with [Cypress](https://www.cypress.io/) under a configuration of `docker-compose`.

Refer to the confluence document "End to end (e2e) testing configuration" for the steps to set up the environments first.

### Original method

After the docker configurations are set up correctly, we can run the e2e test by the below steps:

1. Run `docker-compose up` to start up the necessary docker containers. Wait for both the frontend and backend to be ready.
2. In another terminal, run `make test-e2e` to run the whole e2e test suite in "headless" mode.

Alternatively, we can run the e2e tests in browser mode by `cd frontend` and then `npx cypress open`.
This will start up a test browser instance that allows us to run and debug specific tests more easily.

3. After running the test, run `make stop-containers` to stop the docker containers. This will help to reduce the time needed to initiate the docker containers for the next time.

### Single command method

Ensure no other containers are running in a different terminal window. From the root folder run `make test-e2e-inside-docker`

### Locally run single spec file

To speed up local development you can set the CYPRESS_PATH environment variable to add a `-s` flag to the cypress command. If you don't have this set or it is empty the full suite will run normally.

- `CYPRESS_PATH=` or `CYPRESS_PATH=""` runs full suite
- `CYPRESS_PATH="-s**/standAloneEstablishment/EditUser/staffRecordsPage.spec.cy.js"` or `CYPRESS_PATH="-scypress/e2e/standAloneEstablishment/EditUser/staffRecordsPage.spec.cy.js"` runs only staffRecordsPage.spec.cy.js. **NB** there should be no space between `-s` and the glob or path, it's a *nix-ism.

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
