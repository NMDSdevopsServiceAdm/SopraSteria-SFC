class BUDI {
  constructor() {
    // initialises with the BUDI
  }

  static TO_ASC = 1;
  static FROM_ASC = 2;
 
  // maps services (main/other)
  static services(direction, originalCode) {
    if (direction == BUDI.TO_ASC) {
      return originalCode + 1;
    } else {
      return originalCode - 1;
    }
  }

  // maps contract type (permanent, temp, volunteer)
  static contractType(direction, originalCode) {
    if (direction == BUDI.TO_ASC) {
      return originalCode + 1;
    } else {
      return originalCode - 1;
    }
  }

}

const THE_BUDI = new BUDI();
exports.BUDI = THE_BUDI;
