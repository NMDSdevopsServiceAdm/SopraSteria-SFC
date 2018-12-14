# NgSfcV2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

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

# Backend Server
Unfortunately, the backend server code is part of the client project & repo. Until refactoring:
* `npm run build`
* `node server` or `PORT=<p1> node server`

Database connection parameters can be overridden using environment variables:
* `DB_HOST` - hostname or IP address
* `DB_PORT` - port number
* `DB_NAME` - name of database
* `DB_USER` - database username
* `DB_PASS` - database password

This launches the backend up on default port 3000 (or P1 of your designation). Open web browser and try: `http://localhost:<port>/api/postcodes/<your  postcode without spaces>