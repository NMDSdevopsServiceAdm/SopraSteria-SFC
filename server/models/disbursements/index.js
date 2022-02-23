const Sequelize = require('sequelize');
const redis = require('redis');

const rc = redis.createClient(6379, 'host');

rc.on('connect', () => console.log('Connected to Redis!'));
rc.on('error', (err) => console.log('Redis Client Error', err));
rc.connect();

const sequelize = new Sequelize('database', 'username', 'password!', {
  host: 'host',
  dialect: 'mssql',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const Qualification = sequelize.define(
  'Qualification',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      field: 'QualificationId',
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: Sequelize.STRING,
      field: 'QualificationCode',
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      field: 'QualificationTitle',
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      field: 'QualificationType',
    },
    awardingBodyId: {
      type: Sequelize.INTEGER,
      field: 'AwardingBodyId',
      allowNull: false,
    },
    level: {
      field: 'Level',
      type: Sequelize.INTEGER,
    },
    credits: {
      type: Sequelize.INTEGER,
      field: 'Credits',
      allowNull: false,
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      field: 'IsDeleted',
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.STRING,
      field: 'CreatedBy',
      allowNull: false,
    },
    createdDate: {
      type: Sequelize.DATE,
      field: 'CreatedDate',
      allowNull: false,
    },
    updatedBy: {
      type: Sequelize.STRING,
      field: 'LastUpdatedBy',
      allowNull: false,
    },
    updatedDate: {
      type: Sequelize.DATE,
      field: 'LastUpdatedDate',
      allowNull: false,
    },
    partOfApprenticeship: {
      type: Sequelize.BOOLEAN,
      field: 'IsPartOfApprenticeship',
      allowNull: false,
    },
    preFunded: {
      type: Sequelize.BOOLEAN,
      field: 'IsPreFunded',
      allowNull: false,
    },
    endPointAssesement: {
      type: Sequelize.BOOLEAN,
      field: 'IsEndPointAssesement',
      allowNull: false,
    },
    levelForEndPointAssesement: {
      type: Sequelize.INTEGER,
      field: 'LevelForEndPointAssesement',
      allowNull: false,
    },
    localAuthority: {
      type: Sequelize.BOOLEAN,
      field: 'IsLocalAuthority',
      allowNull: false,
    },
  },
  {
    tableName: 'Qualifications',
    createdAt: false,
    updatedAt: false,
  },
);

const findAllQuals = async () => {
  if (await rc.exists('quals')) {
    return JSON.parse(await rc.get('quals'));
  } else {
    const quals = await Qualification.findAll();
    await rc.set('quals', JSON.stringify(quals));
    return quals;
  }
};

(async () => {
  await findAllQuals();
})();

module.exports = {
  sequelize,
};
