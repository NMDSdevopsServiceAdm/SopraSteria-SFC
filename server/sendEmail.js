// this is simply to test sending emails via AWA SES

// NOTE - these are the default environment variables used by AWS
const apiKey = process.env.AWS_ACCESS_KEY_ID;
const apiSecret = process.env.AWS_SECRET_ACCESS_KEY;

// using npm "node-ses" - simple AWS API for SES service
const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
const SES = new AWS.SES({apiVersion: '2010-12-01'});

// sending mail is restricted policy attached to the account
const goodParam = {
  Destination: { /* required */
    // CcAddresses: [
    //   'EMAIL_ADDRESS',
    //   /* more items */
    // ],
    ToAddresses: [
      'warren@anglo-dutch.me.uk',
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: 'Hello <b>Warren</b>. You get this?'
      },
      Text: {
       Charset: "UTF-8",
       Data: 'Plain Text Email'
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'greetings from SfC'
     }
    },
  Source: 'warren.ayling@wozitech-ltd.co.uk', /* required */
  ReplyToAddresses: [
     'warren.ayling@wozitech-ltd.co.uk',
    /* more items */
  ],
};

// can't send from this email addres
const badParam = {
    Destination: { /* required */
      // CcAddresses: [
      //   'EMAIL_ADDRESS',
      //   /* more items */
      // ],
      ToAddresses: [
        'warren.ayling@wozitech-ltd.co.uk',
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: 'Hello <b>Warren</b>. You get this?'
        },
        Text: {
         Charset: "UTF-8",
         Data: 'Plain Text Email'
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'greetings from SfC'
       }
      },
    Source: 'warren@anglo-dutch.me.uk', /* required */
    ReplyToAddresses: [
       'warren@anglo-dutch.me.uk',
      /* more items */
    ],
  };


const sendMyEmail = async () =>  {
    try {
        const goodSendPromise = await SES.sendEmail(goodParam).promise();
        console.log("WA DEBUG@ sendPromise: ", goodSendPromise);

        const badSendPromise = await SES.sendEmail(badParam).promise();
        console.log("WA DEBUG@ sendPromise: ", badSendPromise);
    } catch (err) {
        console.error(err);
    }
};

sendMyEmail();
