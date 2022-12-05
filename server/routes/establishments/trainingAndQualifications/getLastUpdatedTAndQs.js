const { getAllTraining } = require('../training/getAllTraining');

const getLastUpdatedTAndQs = async (req, res) => {
  const estalishmentId = req.estalishmentId;

  try {
    const formattedTraining = await getAllTraining(establishmentId);
  } catch (error) {
    console.error();
    res.sendStatus(500);
  }
};

module.exports = getLastUpdatedTAndQs;
