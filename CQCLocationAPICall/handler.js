const axios = require('axios');
const axiosRetry = require('axios-retry');
const models = require('./models/index');
//CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';
axiosRetry(axios, { retries: 3 });

const BULK_UPLOAD=0;
const REFRESH=1;
const METHOD=REFRESH;

module.exports.handler =  async (event, context) => {
    try {
      switch (METHOD) {
        case BULK_UPLOAD:
          await populateAllLocations(url);
          break;

        case REFRESH:
          let startDate;

          // Finds last successful API call and uses the lastUpdatedAt value as a start date for the query.
          await models.cqclog.findAll({
            limit: 1,
            where: {
              success:true
            },
            order: [ [ 'createdat', 'DESC' ]]
          }).then(function(entries){
            startDate = entries[0].dataValues.lastUpdatedAt;
          });

          // Set end date for query to now. Regex to remove milliseconds from ISO Date String
          const endDate=new Date().toISOString().split('.')[0]+"Z";

          let locations = await getIndividualLocations(await getChangedIds(startDate,endDate));

          await writeToLocationsTable(locations);

          // Log Successful API and DB population with last update date and time
          await models.cqclog.create({
            success: true,
            message: "Call Successful",
            lastUpdatedAt: endDate
          });
          break;
      }
      process.exit();
      return {status: 200,
        body: "Call Successful"};

    } catch (e) {
      if (METHOD === REFRESH) {
        //Get Error message and write to Log Table
        await models.cqclog.create({
          success:false,
          message: e.message
        });
      }
      console.error(e);
      process.exit();
      return  e.message;
    }

    //Finds and returns any IDs from the Change API between two timestamps.
    async function getChangedIds(startTimestamp, endTimestamp) {

      let changes = [];
      let nextPage='/changes/location?page=1&perPage=1000&startTimestamp=' + startTimestamp + '&endTimestamp=' + endTimestamp;
      do {
        let changeUrl = url + nextPage;

        let response = await axios.get(changeUrl);
        nextPage = response.data.nextPageUri;

        for (let i=0, len=response.data.changes.length; i<len; i++) {
          changes.push(response.data.changes[i]);
        }
      } while (nextPage != null);
      console.log('There are ' + changes.length + ' changes');
      return changes;
    }

    //Gets CQC Location and address details for individual locations.
    async function getIndividualLocations(locationIds){
      let locations = [];

      for (let i=0, len=locationIds.length; i<len; i++){
        try {
          let individualLocation = await axios.get(url+'/locations/'+locationIds[i]);
          if (!individualLocation.data.deregistrationDate) {
            // not deregistered so must exist
            locations.push(individualLocation.data);
          }

          if (i % 100 === 0) {
            console.log("... fetched records: ", i)
          }
        } catch (error) {
          console.error(error);
        }
      }

      return locations;
    }

    //Method to map location data to the Locations DB Table and insert or update.
    async function writeToLocationsTable(locations){

      for (let i=0, len=locations.length; i<len; i++){
        await models.location.upsert({
          locationid:locations[i].locationId,
          locationname: locations[i].name,
          addressline1: locations[i].postalAddressLine1,
          addressline2: locations[i].postalAddressLine2,
          towncity: locations[i].postalAddressTownCity,
          county: locations[i].postalAddressCounty,
          postalcode: locations[i].postalCode,
          mainservice: (locations[i].gacServiceTypes.length>0) ? locations[i].gacServiceTypes[0].name : null
        })
      }
    }

  // BACKUP CODE TO RESTORE/RECREATE LOCATION TABLE DATA
  // Call to populate location data from CQC API. Inserts 1000 records at a time if successful. Best run using serverless offline
  // (Included in package Dev Dependencies)
  // If the API calls fail at any point, you can resume by updating the page parameter in nextpage to represent where
  // the call left off. E.G if there are 2000 rows in DB, /locations?page=3
  //
  async function populateAllLocations(url){
    let response;
    let nextPage='/locations?page=1&perPage=1000';

    do{
      let locationIds = [];
      console.log("Fetching remote data: ", url+nextPage)
      response = await axios.get(url+nextPage);
      nextPage = response.data.nextPageUri;

      for (let i=0, len=response.data.locations.length; i<len; i++){
        locationIds.push(response.data.locations[i].locationId)
      }

      let locations = await getIndividualLocations(locationIds);

      for (let i=0, len=locations.length; i<len; i++){
        await models.location.create({
          locationid:locations[i].locationId,
          locationname: locations[i].name,
          addressline1: locations[i].postalAddressLine1,
          addressline2: locations[i].postalAddressLine2,
          towncity: locations[i].postalAddressTownCity,
          county: locations[i].postalAddressCounty,
          postalcode: locations[i].postalCode,
          mainservice: (locations[i].gacServiceTypes.length>0) ? locations[i].gacServiceTypes[0].name : null
        })
      }
    } while (nextPage != null);
  }
};
