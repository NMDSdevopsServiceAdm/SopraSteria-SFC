const router = require('express').Router();
const models = require('../../../models');
const uuid = require('uuid');

router.route('/create-admin-user').post(async (req, res) => {
  await createAdminUser(req, res);
});

router.route('/').get(async (req, res) => {
  await fetchAdminUsers(req, res);
});

const createAdminUser = async (req, res) => {
  const { adminUser } = req.body;

  try {
    const uid = uuid.v4();
    const user = await models.user.findByUUID(req.userUid);
    await models.user.createAdminUser({ ...adminUser, uid, updatedBy: user.FullNameValue });
    res.status(200).json({ message: 'Admin user successfully created' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Admin user could not be created' });
  }
};

const fetchAdminUsers = async (req, res) => {
  try {
    const adminUsers = await models.user.fetchAdminUsers();
    res.status(200).json({ adminUsers });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Could not fetch admin users' });
  }
};

module.exports = router;
module.exports.createAdminUser = createAdminUser;
module.exports.fetchAdminUsers = fetchAdminUsers;
