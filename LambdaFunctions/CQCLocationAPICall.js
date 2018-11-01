const https = require('https');

exports.handler = (event, context, callback) => {

    //Endpoint for all CQC Location Data
    const url = 'https://api.cqc.org.uk/public/v1/locations';

    let data = '';

    const req = https.request(url, (res) => {

        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (chunk) => data += chunk);
        //For now, log and write JSON response to show successful API call. Logic to handle failures and writing to DB to come
        res.on('end', () => {
            console.log('Successfully processed HTTPS response');
            data = JSON.parse(data).locations;
            callback(null, data);
        });
    });
    req.on('error', callback);
    req.write(JSON.stringify(data));
    req.end();
};