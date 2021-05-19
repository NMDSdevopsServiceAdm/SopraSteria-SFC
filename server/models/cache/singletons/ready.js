const ready = (models, className, errorName) => {
  if (models.status.ready) {
    className
      .initialize()
      .then()
      .catch((err) => {
        console.error(`Failed to initialise ${errorName}: `, err);
      });
  } else {
    models.status.on(models.status.READY_EVENT, () => {
      className
        .initialize()
        .then()
        .catch((err) => {
          console.error(`Failed to initialise ${errorName}: `, err);
        });
    });
  }
};

exports.ready = ready;
