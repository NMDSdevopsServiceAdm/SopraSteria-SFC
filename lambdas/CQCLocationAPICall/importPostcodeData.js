const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const models = require('./models/index');

try {
  fs.readdir('./pcodefile', async (error, files) => {
    if (error) {
      console.error(error);
    }

    console.log(files);
    try {
      files.map(file => {
        let index = 0;
        fs.createReadStream(path.resolve(__dirname, 'pcodefile', file))
          .pipe(csv.parse({ headers: false }))
          .on('error', error => console.error(error))
          .on('data', async row => {
            const pcodeLocation = {
              uprn: row[0],
              sub_building_name: row[21],
              building_name: row[22],
              building_number: row[23],
              street_description: row[49],
              post_town: row[60],
              postcode: row[65],
              local_custodian_code: row[12],
              county: row[61],
              rm_organisation_name: row[17]
            }

            if (index % 1000 === 0) console.log(`Created/Updated ${index}`);
            try {
              await models.pcodedata.upsert(pcodeLocation);
            } catch (error) {
              console.error(error);
            }
            index++;
          })
          .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
      });
    } catch (error) {
      console.error(error);
    }
  });
} catch (error) {
  console.error(error);
}
