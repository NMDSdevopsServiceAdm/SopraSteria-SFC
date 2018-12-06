exports.sanitisePostcode= function(userPostcode){

  //Remove whitespaces and any non alphanumeric characters and then cast to upper case.
  let cleanedPostcode = userPostcode.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

  //Insert space in correct position depending on postcode length.
  if (cleanedPostcode.length === 6){
    cleanedPostcode = cleanedPostcode.substr(0, 3) + ' ' + cleanedPostcode.substr(3);
  } else if (cleanedPostcode.length === 7){
    cleanedPostcode = cleanedPostcode.substr(0, 4) + ' ' + cleanedPostcode.substr(4);
  }

  //Test final string against RegEx provided by UK Gov to verify is a valid postcode. If fails, return null.
  return(/([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/.test(cleanedPostcode)) ? cleanedPostcode : null;

};
