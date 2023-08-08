#! /bin/bash

echo 'Starting split of codebase'

echo '****** FRONTEND ******'

if ["./frontend" ]; then
  echo 'There is already a frontend folder'
else
  echo 'Moving frontend files and folders to a new frontend folder'
  mkdir frontend

  frontendFolders=('src' '.angular' 'service_unavailable')
  for folder in ${frontendFolders[@]}; do
    mv $folder ./frontend
    echo $folder folder moved to frontend folder
  done

  frontendFiles=('.editorconfig' 'angular.json' 'index.html' 'index.prod.html' 'index.test.html' 'proxy.conf.json' 'testing-webpack.config.js' 'tsconfig.eslint.json' 'tsconfig.json')

  for file in ${frontendFiles[@]}; do
    mv $file ./frontend
    echo $file moved to frontend folder
  done

  echo 'Finished moving frontend files and folders to the new frontend folder'
  echo 'Create package.json for frontend folder'

  if [ -f "frontend/package.json" ] ; then
    rm -rf frontend/package.json
  fi

  touch frontend/package.json

  echo '
  {
    "name": "ng-sfc-v2",
    "version": "0.0.1",
    "scripts": {
      "ng": "ng",
      "build": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --no-progress",
      "build:clean": "rimraf dist",
      "build:watch": "ng serve --proxy-config proxy.conf.json",
      "build:prod": "npm run build:clean && npm run build -- --configuration=production",
      "build:preprod": "npm run build:clean && npm run build -- --configuration=preproduction",
      "build:test": "npm run build:clean && npm run build -- --configuration=test",
      "test": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng --source-map=false test",
      "cover:test": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --source-map=false --no-watch --code-coverage",
      "test-headless": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --source-map=false --no-watch --code-coverage --browsers=ChromeHeadless",
      "lint": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng lint"
    },
    "private": true,
    "dependencies": {
      "@angular/animations": "^14.3.0",
      "@angular/cdk": "^14.2.7",
      "@angular/cli": "^14.2.11",
      "@angular/common": "^14.3.0",
      "@angular/compiler": "^14.3.0",
      "@angular/compiler-cli": "^14.2.11",
      "@angular/core": "^14.3.0",
      "@angular/forms": "^14.3.0",
      "@angular/platform-browser": "^14.3.0",
      "@angular/platform-browser-dynamic": "^14.3.0",
      "@angular/router": "^14.3.0",
      "@auth0/angular-jwt": "^5.0.2",
      "@babel/runtime": "^7.21.0",
      "@istanbuljs/nyc-config-typescript": "^1.0.1",
      "@sentry/browser": "^6.13.1",
      "@sentry/integrations": "^6.13.1",
      "@sentry/node": "^6.13.1",
      "@sentry/tracing": "^6.13.1",
      "@types/offscreencanvas": "^2019.7.0",
      "ajv-errors": "^1.0.1",
      "angulartics2": "^10.0.0",
      "canvg": "^3.0.7",
      "configcat-js": "^5.5.0",
      "core-js": "^3.9.0",
      "dayjs": "^1.10.7",
      "details-element-polyfill": "^2.4.0",
      "file-saver": "^2.0.5",
      "govuk-frontend": "^3.10.2",
      "highcharts": "^8.2.2",
      "highcharts-angular": "^2.8.2",
      "is-ci": "^3.0.0",
      "jspdf": "^2.2.0",
      "lodash": "^4.17.21",
      "ngx-dropzone": "^2.3.0",
      "request": "^2.88.2",
      "rxjs": "^6.6.7",
      "rxjs-compat": "^6.6.7",
      "slugify": "^1.4.6",
      "tslib": "^2.0.0",
      "typescript": "^4.6.4",
      "url-parse": "^1.4.7",
      "zone.js": "~0.11.4"
    },
    "devDependencies": {
      "@angular-builders/custom-webpack": "^14.1.0",
      "@angular-devkit/build-angular": "^14.2.11",
      "@angular-eslint/builder": "1.2.0",
      "@angular-eslint/eslint-plugin": "1.2.0",
      "@angular-eslint/eslint-plugin-template": "^1.2.0",
      "@angular-eslint/schematics": "^1.2.0",
      "@angular-eslint/template-parser": "1.2.0",
      "@angular/language-service": "^14.3.0",
      "@jackfranklin/test-data-bot": "^1.3.0",
      "@lhci/cli": "^0.7.0",
      "@ngx-builders/analyze": "^2.3.0",
      "@testing-library/angular": "^10.10.0",
      "@testing-library/dom": "^7.31.0",
      "@testing-library/user-event": "^12.7.3",
      "@types/faker": "^5.5.9",
      "@types/file-saver": "^2.0.3",
      "@types/jasmine": "^3.10.3",
      "@types/jasminewd2": "^2.0.10",
      "@types/lodash": "^4.14.176",
      "@types/node": "^16.11.6",
      "@types/sinon": "^10.0.5",
      "@typescript-eslint/eslint-plugin": "4.0.0",
      "@typescript-eslint/parser": "3.10.1",
      "ajv": "^6.12.6",
      "ajv-formats": "^2.1.0",
      "aws-sdk-mock": "^5.2.1",
      "chai": "^4.3.0",
      "codelyzer": "^6.0.2",
      "cypress": "^9.7.0",
      "cypress-slow-down": "^1.2.1",
      "eslint": "^7.23.0",
      "eslint-config-prettier": "^7.2.0",
      "faker": "^5.5.3",
      "husky": "^4.3.8",
      "jasmine-core": "^3.10.0",
      "jasmine-spec-reporter": "^7.0.0",
      "karma": "^6.3.11",
      "karma-chrome-launcher": "^3.1.0",
      "karma-coverage": "~2.0.3",
      "karma-jasmine": "^4.0.1",
      "karma-junit-reporter": "^2.0.1",
      "karma-parallel": "^0.3.1",
      "karma-spec-reporter": "^0.0.34",
      "lint-staged": "^10.5.4",
      "mocha": "^8.3.0",
      "mocha-junit-reporter": "^2.0.2",
      "node-mocks-http": "^1.11.0",
      "nodemon": "^2.0.13",
      "npm": "^7.6.3",
      "npm-run-all": "^4.1.5",
      "nyc": "^15.1.0",
      "opener": "^1.5.2",
      "prettier": "2.5.1",
      "protractor": "^7.0.0",
      "puppeteer": "^13.5.1",
      "require-dir": "^1.2.0",
      "rimraf": "^3.0.2",
      "sandboxed-module": "^2.0.4",
      "sinon": "^9.2.4",
      "sinon-chai": "^3.7.0",
      "source-map-explorer": "^2.5.2",
      "supertest": "^6.2.2",
      "ts-node": "~9.1.1",
      "tslint": "~6.1.3",
      "webpack-bundle-analyzer": "^4.4.2"
    },
    "engines": {
      "node": "16",
      "npm": "8"
    },
    "nyc": {
      "branches": 22,
      "lines": 31,
      "functions": 32,
      "statements": 31,
      "extends": "@istanbuljs/nyc-config-typescript",
      "all": true,
      "check-coverage": true,
      "include": [
        "lambdas/**/*.js",
        "server/**/*.js",
        "server.js"
      ],
      "exclude": [
        "lambdas/bulkUpload/test/**/*",
        "lambdas/sendingEmails/sendEmails/test/**/*",
        "server/test/**/*"
      ]
    },
    "husky": {
      "hooks": {
        "pre-commit": "lint-staged"
      }
    },
    "lint-staged": {
      "*.{js,ts,component.html}": [
        "eslint --cache --fix",
        "prettier --write"
      ],
      "*.{css,md}": "prettier --write"
    },
    "optionalDependencies": {
      "esbuild-android-arm64": "^0.15.18"
    }
  }' >> frontend/package.json
fi

echo 'Finished settng up frontend folder'

echo '****** BACKEND *******'
if ["./backend" ]; then
  echo 'There is already a backend folder'
else
  echo 'Moving backend files and folders to a new backend folder'
  mkdir backend

  backendFolders=('server' 'migrations' 'resources' 'reference' 'bin' 'uploads')

  for folder in ${backendFolders[@]}; do
    mv $folder ./backend
    echo $folder folder moved to backend folder
  done

  backendFiles=('server.js' '.sequelizerc')
  for file in ${backendFiles[@]}; do
    mv $file ./backend
    echo $file moved to backend folder
  done

  echo 'Finished moving backend files and folders to the new backend folder'
  echo 'Create package.json for backend folder'

  if [ -f "backend/package.json" ] ; then
    rm -rf backend/package.json
  fi

  touch backend/package.json

  echo '
  {
  "name": "ng-sfc-v2",
  "version": "0.0.1",
  "scripts": {
    "new-start": "npm run api:server",
    "start": "npm run cf:migrate && node --max-old-space-size=4096 server.js",
    "build": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --no-progress",
    "build:clean": "rimraf dist",
    "build:watch": "ng serve --proxy-config proxy.conf.json",
    "build:prod": "npm run build:clean && npm run build -- --configuration=production",
    "build:preprod": "npm run build:clean && npm run build -- --configuration=preproduction",
    "build:test": "npm run build:clean && npm run build -- --configuration=test",
    "test": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng --source-map=false test",
    "cover:test": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --source-map=false --no-watch --code-coverage",
    "test-headless": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --source-map=false --no-watch --code-coverage --browsers=ChromeHeadless",
    "lint": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng lint",
    "api:server": "nodemon --inspect server.js",
    "server": "npm-run-all -p -l build:watch api:server",
    "server:test": "mocha server/test/**/*.spec.js",
    "server:e2e": "export NODE_ENV=e2etest && npm-run-all -p -l build:watch api:server",
    "server:test:e2e": "cypress run",
    "server:test:e2e:open": "cypress open",
    "server:test:unit": "mocha --exit 'server/test/unit/**/*.spec.js'",
    "lambda:test:unit": "mocha --exit lambdas/**/*.spec.js",
    "server:test:unit:ci": "mocha --reporter mocha-junit-reporter --exit 'server/test/unit/**/*.spec.js'",
    "server:test:integration": "mocha --exit server/test/integration/**/*.spec.js",
    "server:cover": "nyc --reporter=html mocha server/test/**/*.spec.js",
    "server:cover:unit": "nyc --reporter=html mocha --exit 'server/test/unit/**/*.spec.js'",
    "server:lambda:cover:unit:ci": "nyc --reporter=lcov --reporter=text mocha --reporter=mocha-junit-reporter --exit '**/test/unit/**/*.spec.js'",
    "server:cover:unit:headless": "nyc mocha --exit 'server/test/unit/**/*.spec.js'",
    "server:cover:integration": "nyc --reporter=html mocha server/test/integration/**/*.spec.js",
    "db:migration:generate": "sequelize migration:generate",
    "db:migrate": "sequelize db:migrate",
    "db:migrate:undo": "sequelize db:migrate:undo",
    "cf:migrate": "node ./bin/cf-migrate.js",
    "test:server": "npm run server"
  },
  "private": true,
  "dependencies": {
    "@babel/runtime": "^7.21.0",
    "@istanbuljs/nyc-config-typescript": "^1.0.1",
    "@sentry/browser": "^6.13.1",
    "@sentry/integrations": "^6.13.1",
    "@sentry/node": "^6.13.1",
    "@sentry/tracing": "^6.13.1",
    "ajv-errors": "^1.0.1",
    "aws-sdk": "^2.833.0",
    "axios": "^0.21.1",
    "bcrypt-nodejs": "0.0.3",
    "celebrate": "^13.0.4",
    "cfenv": "^1.2.4",
    "cheerio": "1.0.0-rc.3",
    "compression": "^1.7.4",
    "convict": "^6.0.0",
    "convict-format-with-validator": "^6.2.0",
    "cookie-parser": "^1.4.5",
    "core-js": "^3.9.0",
    "csv-parse": "^5.0.4",
    "csvtojson": "^2.0.10",
    "dayjs": "^1.10.7",
    "exceljs": "^4.2.0",
    "express": "^4.17.1",
    "express-http-proxy": "^1.6.2",
    "express-rate-limit": "^5.5.1",
    "express-sanitizer": "^1.0.6",
    "helmet": "^4.6.0",
    "honeycomb-beeline": "^2.7.0",
    "is-ci": "^3.0.0",
    "js-yaml": "^3.14.1",
    "jsonwebtoken": "^8.5.1",
    "jszip": "^3.6.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.1",
    "moment-timezone": "^0.5.33",
    "morgan": "^1.10.0",
    "multer": "^1.4.4",
    "notifications-node-client": "^5.1.1",
    "openpgp": "^5.0.0-1",
    "p-ratelimit": "^1.0.1",
    "passport": "^0.4.1",
    "passport-jwt": "^4.0.0",
    "pdf-lib": "^1.17.1",
    "pg": "^8.5.1",
    "pg-hstore": "^2.3.4",
    "pug": "^3.0.1",
    "rate-limit-redis": "^2.1.0",
    "request": "^2.88.2",
    "sequelize": "^6.29.0",
    "sequelize-cli": "^6.6.0",
    "sequelize-replace-enum-postgres": "^1.6.0",
    "sib-api-v3-sdk": "^8.2.1",
    "toobusy-js": "^0.5.1",
    "tslib": "^2.0.0",
    "typescript": "^4.6.4",
    "ua-parser-js": "^0.7.28",
    "util": "^0.12.4",
    "uuid": "^8.3.2",
    "walk": "^2.3.14",
    "xss-clean": "^0.1.1"
  },
  "devDependencies": {
    "@jackfranklin/test-data-bot": "^1.3.0",
    "@lhci/cli": "^0.7.0",
    "@ngx-builders/analyze": "^2.3.0",
    "@testing-library/dom": "^7.31.0",
    "@testing-library/user-event": "^12.7.3",
    "@types/faker": "^5.5.9",
    "@types/file-saver": "^2.0.3",
    "@types/jasmine": "^3.10.3",
    "@types/jasminewd2": "^2.0.10",
    "@types/lodash": "^4.14.176",
    "@types/node": "^16.11.6",
    "@types/sinon": "^10.0.5",
    "@typescript-eslint/eslint-plugin": "4.0.0",
    "@typescript-eslint/parser": "3.10.1",
    "ajv": "^6.12.6",
    "ajv-formats": "^2.1.0",
    "aws-sdk-mock": "^5.2.1",
    "chai": "^4.3.0",
    "codelyzer": "^6.0.2",
    "cypress": "^9.7.0",
    "cypress-slow-down": "^1.2.1",
    "eslint": "^7.23.0",
    "eslint-config-prettier": "^7.2.0",
    "faker": "^5.5.3",
    "husky": "^4.3.8",
    "jasmine-core": "^3.10.0",
    "jasmine-spec-reporter": "^7.0.0",
    "karma": "^6.3.11",
    "karma-chrome-launcher": "^3.1.0",
    "karma-coverage": "~2.0.3",
    "karma-jasmine": "^4.0.1",
    "karma-junit-reporter": "^2.0.1",
    "karma-parallel": "^0.3.1",
    "karma-spec-reporter": "^0.0.34",
    "lint-staged": "^10.5.4",
    "mocha": "^8.3.0",
    "mocha-junit-reporter": "^2.0.2",
    "node-mocks-http": "^1.11.0",
    "nodemon": "^2.0.13",
    "npm": "^7.6.3",
    "npm-run-all": "^4.1.5",
    "nyc": "^15.1.0",
    "opener": "^1.5.2",
    "prettier": "2.5.1",
    "protractor": "^7.0.0",
    "puppeteer": "^13.5.1",
    "require-dir": "^1.2.0",
    "rimraf": "^3.0.2",
    "sandboxed-module": "^2.0.4",
    "sinon": "^9.2.4",
    "sinon-chai": "^3.7.0",
    "source-map-explorer": "^2.5.2",
    "supertest": "^6.2.2",
    "webpack-bundle-analyzer": "^4.4.2"
  },
  "engines": {
    "node": "16",
    "npm": "8"
  },
  "nyc": {
    "branches": 22,
    "lines": 31,
    "functions": 32,
    "statements": 31,
    "extends": "@istanbuljs/nyc-config-typescript",
    "all": true,
    "check-coverage": true,
    "include": [
      "lambdas/**/*.js",
      "server/**/*.js",
      "server.js"
    ],
    "exclude": [
      "lambdas/bulkUpload/test/**/*",
      "lambdas/sendingEmails/sendEmails/test/**/*",
      "server/test/**/*"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,component.html}": [
      "eslint --cache --fix",
      "prettier --write"
    ],
    "*.{css,md}": "prettier --write"
  },
  "optionalDependencies": {
    "esbuild-android-arm64": "^0.15.18"
  }
}' >> backend/package.json
fi
echo 'Finished settng up backend folder'

echo '***** CLEAN UP OLD FOLDERS & FILES *****'
echo 'Remove node modules from the root directory'
rm -rf ./node_modules
rm -rf ./.circleci

echo 'Remove manifest files and original package.json files'
manifestFiles=('manifest.benchmarks.yml' 'manifest.prod.yml' 'manifest.preprod.yml' 'manifest.test.yml' 'package.json' 'package-lock.json')
for file in ${manifestFiles[@]} ; do
  rm -rf $file
  echo $file deleted
done

echo 'Clean up completed'
echo 'Migration scripts completed *************'



