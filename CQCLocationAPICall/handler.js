const axios = require('axios');
const models = require('./models/index');

module.exports.handler =  async (event, context) => {

    //CQC Endpoint
    const url = 'https://api.cqc.org.uk/public/v1';

    try{
        let locations= await getAllLocations(url);

        //Empty Location Table
        models.location.destroy({
          where:{},
          truncate:true
        });

        //Iterate through locations and add to DB
        for (let i=0, len=locations.length; i<len; i++){
          await models.location.create({
            locationid:locations[i].locationId,
            locationname: locations[i].locationName,
            postalcod: locations[i].postalCode
          })
        }

        //Log Successful API and DB population.
        await models.cqclog.create({
          success: true,
          message: "Call Successful"
        });

        return {status: 200,
                body: "Call Successful"};
    } catch (e) {
      console.error(e);
        await models.cqclog.create({
          success:false,

        //To Do: Get meaningful Error Message.
        //  message: JSON.stringify(e)
        });
    }

    async function getAllLocations(url){
      let response;
      let locations = [];
      //Set initial page and number of locations called.
      let nextPage='/locations?page=1&perPage=10000';

      do{
         response = await axios.get(url+nextPage);
         nextPage = response.data.nextPageUri;
         for (let i=0, len=response.data.locations.length; i<len; i++){
           locations.push(response.data.locations[i]);
         }
      } while (nextPage != null);

      return locations;
    }

};
