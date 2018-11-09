const axios = require('axios');
const models = require('./models/index');

module.exports.hello =  async (event, context) => {

    //Endpoint for all CQC Location Data
    const url = 'https://api.cqc.org.uk/public/v1/locations?perPage=90000';

    try{
        let locations= await getLocations(url);

        for (let i=0, len=locations.length; i<len; i++){

           await models.Location.create({
                locationId:locations[i].locationId,
                name: locations[i].locationName,
                postalCode: locations[i].postalCode
             })
        }
        return {status: 200,
                body: "Call Successful"};
    } catch (e) {
        console.error("Error");
        return  JSON.stringify(e.response.data);
    }

    async function getLocations(url){
        const response = await axios.get(url);
        return response.data.locations;
    }

};