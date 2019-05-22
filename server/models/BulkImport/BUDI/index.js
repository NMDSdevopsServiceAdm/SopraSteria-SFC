class BUDI {
  constructor() {
    // initialises with the BUDI
  }

  static get TO_ASC() { return 100; }
  static get FROM_ASC() { return 200; }

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

exports.BUDI = BUDI;
