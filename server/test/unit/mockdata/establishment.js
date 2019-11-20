exports.data = [
  {
    "localIdentifier": "My establishment",
    "name": "Sunset health care",
    "isRegulated": true,
    "nmdsId": "H1002354",
    "address1": "Unit 1A, Sunset House",
    "address2": "Sunset Lane",
    "address3": '',
    "postcode": "LS1 1AA",
    "town": "Leeds",
    "county": "Leeds",
    "provId": "",
    "locationId": "1-1000210669",
    "provid": '',
    "shareWith": {
      "enabled": true,
      "with": "CQC; Local Authority;"
    },
    "shareWithLA": [
      {
        "cssrId": 212
      }
    ],
    "mainService": {
      "id": 1,
      "budi": 13
    },
    "otherServices": [
      {
        "id": 2,
        "budi": 15
      },
      {
        "id": 3,
        "budi": 18
      },
      {
        "id": 36,
        "budi": 60,
        "other": "Test Service"
      }
    ],
    "employerType": {
      "value": "Local Authority (generic/other)",
      "id": 3
    },
    "capacities": [
      {
        "reference": {
          "id": 1
        }
      },
      {
        "reference": {
          "id": 2
        }
      },
      {
        "reference": {
          "id": 3
        }
      },
      {
        "reference": {
          "id": 36,
          "other": "Test Service"
        }
      }
    ],
    "serviceUsers": [
      {
        "id": 10,
        "budi": 28
      },
      {
        "id": 20,
        "budi": 18,
        "other": "Test Service Users"
      }
    ],
    "numberOfStaff": 367,
    "starters": [
      {
        "jobId": 13,
        "budi": 3
      },
      {
        "jobId": 8,
        "budi": 40
      }
    ],
    "leavers": [
      {
        "jobId": 13,
        "budi": 3
      },
      {
        "jobId": 8,
        "budi": 40
      },
      {
        "jobId": 9,
        "budi": 41
      },
      {
        "jobId": 12,
        "budi": 10
      }
    ],
    "vacancies": [
      {
        "jobId": 9,
        "budi": 41
      },
      {
        "jobId": 12,
        "budi": 10
      }
    ],
    "reasonsForLeaving": "Better Pay:1|Better Hours:1"
  }
];

exports.knownHeaders = [
  "LOCALESTID",
  "STATUS",
  "ESTNAME",
  "ADDRESS1",
  "ADDRESS2",
  "ADDRESS3",
  "POSTTOWN",
  "POSTCODE",
  "ESTTYPE",
  "OTHERTYPE",
  "PERMCQC",
  "PERMLA",
  "SHARELA",
  "REGTYPE",
  "PROVNUM",
  "LOCATIONID",
  "MAINSERVICE",
  "ALLSERVICES",
  "CAPACITY",
  "UTILISATION",
  "SERVICEDESC",
  "SERVICEUSERS",
  "OTHERUSERDESC",
  "TOTALPERMTEMP",
  "ALLJOBROLES",
  "STARTERS",
  "LEAVERS",
  "VACANCIES",
  "REASONS",
  "REASONNOS"
];
