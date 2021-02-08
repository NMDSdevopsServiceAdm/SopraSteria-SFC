const establishmentErrorsWarnings = `[
  {
    "origin": "Establishments",
    "lineNumber": 2,
    "errCode": 1280,
    "errType": "ALL_JOBS_ERROR",
    "source": "8;3;38",
    "name": "SKILLS FOR CARE",
    "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one"
  },
  {
    "origin": "Establishments",
    "lineNumber": 3,
    "errCode": 1280,
    "errType": "ALL_JOBS_ERROR",
    "source": "",
    "name": "Test",
    "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one"
  },
  {
    "origin": "Establishments",
    "lineNumber": 3,
    "source": "",
    "name": "Test",
    "warnCode": 2200,
    "warnType": "TOTAL_PERM_TEMP_WARNING",
    "warning": "TOTALPERMTEMP (Total staff and the number of worker records) does not match"
  },
  {
    "origin": "Establishments",
    "lineNumber": 2,
    "errCode": 1110,
    "errType": "LOCATION_ID_ERROR",
    "error": "LOCATIONID has not been supplied",
    "source": "",
    "name": "SKILLS FOR CARE"
  }
]`;

const workerErrorsWarnings = `[
    {
      "origin": "Workers",
      "lineNumber": 2,
      "errCode": 1280,
      "errType": "ALL_JOBS_ERROR",
      "source": "8;3;38",
      "name": "SKILLS FOR CARE",
      "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one",
      "worker": "STAFFREF"
    },
    {
      "origin": "Workers",
      "lineNumber": 3,
      "errCode": 1280,
      "errType": "ALL_JOBS_ERROR",
      "source": "",
      "name": "Test",
      "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one",
      "worker": "STAFFREF"
    },
    {
      "origin": "Workers",
      "lineNumber": 3,
      "source": "",
      "name": "Test",
      "warnCode": 2200,
      "warnType": "TOTAL_PERM_TEMP_WARNING",
      "warning": "TOTALPERMTEMP (Total staff and the number of worker records) does not match",
      "worker": "STAFFREF"
    },
    {
      "origin": "Workers",
      "lineNumber": 2,
      "errCode": 1110,
      "errType": "LOCATION_ID_ERROR",
      "error": "LOCATIONID has not been supplied",
      "source": "",
      "name": "SKILLS FOR CARE",
      "worker": "STAFFREF"
    }
  ]`;

const trainingErrorsWarnings = `[
    {
      "origin": "Training",
      "lineNumber": 2,
      "errCode": 1280,
      "errType": "ALL_JOBS_ERROR",
      "source": "8;3;38",
      "name": "SKILLS FOR CARE",
      "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one",
      "worker": "STAFFREF"
    },
    {
      "origin": "Training",
      "lineNumber": 3,
      "errCode": 1280,
      "errType": "ALL_JOBS_ERROR",
      "source": "",
      "name": "Test",
      "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one",
      "worker": "STAFFREF"
    },
    {
        "origin": "Training",
        "lineNumber": 6,
        "errCode": 1280,
        "errType": "ALL_JOBS_ERROR",
        "source": "",
        "name": "Test2",
        "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one",
        "worker": "STAFFREF"
    },
    {
      "origin": "Training",
      "lineNumber": 3,
      "source": "",
      "name": "Test",
      "warnCode": 2200,
      "warnType": "TOTAL_PERM_TEMP_WARNING",
      "warning": "TOTALPERMTEMP (Total staff and the number of worker records) does not match",
      "worker": "STAFFREF"
    },
    {
      "origin": "Training",
      "lineNumber": 2,
      "errCode": 1110,
      "errType": "LOCATION_ID_ERROR",
      "error": "LOCATIONID has not been supplied",
      "source": "",
      "name": "SKILLS FOR CARE",
      "worker": "STAFFREF"
    }
  ]`;

const establishmentErrorWarnings = `[
  {
    "origin": "Establishments",
    "lineNumber": 2,
    "errCode": 1280,
    "errType": "ALL_JOBS_ERROR",
    "source": "8;3;38",
    "name": "SKILLS FOR CARE",
    "error": "You do not have a staff record for a Registered Manager therefore must record a vacancy for one"
  },
  {
    "origin": "Establishments",
    "lineNumber": 3,
    "source": "",
    "name": "Test",
    "warnCode": 2200,
    "warnType": "TOTAL_PERM_TEMP_WARNING",
    "warning": "TOTALPERMTEMP (Total staff and the number of worker records) does not match"
  }
]`;
module.exports.establishmentErrorsWarnings = establishmentErrorsWarnings;
module.exports.workerErrorsWarnings = workerErrorsWarnings;
module.exports.trainingErrorsWarnings = trainingErrorsWarnings;
module.exports.establishmentErrorWarnings = establishmentErrorWarnings;
