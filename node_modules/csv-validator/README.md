# `csv-validator`

nodejs validator for csv file

# Features

* Parse csv (supports only file as of now) and convert to json array
* Validate each line with type or RegExp
* Return each line's error with error message
* Support callback and promise
* Non-blocking parsing

# Install

```sh
npm install csv-validator --save
```

# Example

Without errors:

```javascript
/** csv file
name,phone,email,country
john,123,john@ph.com,PH
doe,456,doe@us.com,US
*/

const csv = require('csv-validator');
const csvFilePath = '<path to csv file>';
const headers = {
    name: '', // any string
    phone: 1, // any number
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // RegExp
    _country: '' // add '_' as first character of the key to indicate as optional
};

csv(csvFilePath, headers)
    .then(console.log) // [ { name: 'john', phone: '123', email: 'john@ph.com', country: 'PH' }, { name: 'doe', phone: '456', email: 'doe@us.com', country: 'US' } ]
```

With error:

```javascript
/** csv file
name,phone,email,country
john,123a,john@ph.com,PH
doe,456,doe@us.com
*/

const csv = require('csv-validator');
const csvFilePath = '<path to csv file>';
const headers = {
    name: '', // any string
    phone: 1, // any number
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // RegExp
    country: '' // add '_' as first character of the key to indicate as optional
};

csv(csvFilePath, headers)
    .then(console.log)
    .catch(console.error) // [ 'Row 1: phone must be a type number', 'Row 2: country is required' ]
```

Error messages:

* **... must be a type number**: the column should be a number
* **... is required**: the column should be filled
* **... must be in /^[0-9]?.*/**: the column should be in RegExp (in this example: /^[0-9]?$/)

# Contribution 

* Any pull request for new features and bug fixes is appreciated.
* Just make sure to add test.

# LICENSE

MIT