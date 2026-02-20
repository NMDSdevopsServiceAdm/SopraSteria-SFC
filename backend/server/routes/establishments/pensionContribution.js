const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../utils/security/hasPermission');
const models = require('../../models');

const updatePensionContribution = async (req, res) => {
  try {
    const { pensionContribution, pensionContributionPercentage } = req.body;
    const establishmentId = req.establishmentId;

    const updates = {};

    // Handle pension value
    if (pensionContribution !== undefined) {
      updates.pensionContribution = pensionContribution;

      // If not "Yes", always clear percentage
      if (pensionContribution !== 'Yes') {
        updates.pensionContributionPercentage = null;
      }
    }

    // Handle percentage (only if explicitly sent)
    if (pensionContributionPercentage !== undefined) {
      updates.pensionContributionPercentage =
        pensionContributionPercentage === '' ? null : pensionContributionPercentage;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    await models.establishment.updateEstablishment(establishmentId, updates);

    const updated = await models.establishment.findOne({
      attributes: ['pensionContribution', 'pensionContributionPercentage'],
      where: { id: establishmentId },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

router.route('/').post(hasPermission('canEditEstablishment'), updatePensionContribution);
module.exports = router;
module.exports.updatePensionContribution = updatePensionContribution;
