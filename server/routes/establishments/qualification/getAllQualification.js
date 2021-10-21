const express = require('express');
const router = express.Router({ mergeParams: true });

const Qualification = require('../../../models/classes/qualification').Qualification;

const { hasPermission } = require('../../../utils/security/hasPermission');


const getAllQualification = async (req, res) => {
    const establishmentId = req.establishmentId;
    const workerUid = req.params.workerId;

    const qualificationRecords = [];

    try {
      const allQualificationRecords = await Qualification.fetch(establishmentId, workerUid);
    //   console.log(allQualificationRecords.qualifications);
      // const groups = allQualificationRecords.qualifications.map(g => {
      //     return {
      //         id: g.qualification.id,
      //         group: g.qualification.group
      //     }
      // });
      const qualificationsSortedByGroup = allQualificationRecords.qualifications.reduce((r, a) =>{
        r[a.qualification.group] = r[a.qualification.group] || [];
        const qualification = {
          title: a.qualification.title,
          year: a.year,
          notes: a.notes,
          uid: a.uid,
        };
        r[a.qualification.group].push(qualification);
        return r;
        }, Object.create(null));
      return res.status(200).json(allQualificationRecords);
    } catch (err) {
      console.error('Qualification::root - failed', err);
      return res.status(500).send(`Failed to get Qualification Records for Worker having uid: ${escape(workerUid)}`);
    }
  };

  router.route('/').get(hasPermission('canEditWorker'), getAllQualification);

  module.exports = router;
  module.exports.getAllQualification = getAllQualification;