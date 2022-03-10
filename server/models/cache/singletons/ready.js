const ready = (models, className, errorName) => {
  const initialzeClass = () =>
    className
      .initialize()
      .then()
      .catch((err) => {
        console.error(`Failed to initialise ${errorName}: `, err);
      });

  if (models.status.ready) {
    initialzeClass();
  } else {
    models.status.on(models.status.READY_EVENT, () => {
      initialzeClass();
    });
  }
};

exports.ready = ready;
