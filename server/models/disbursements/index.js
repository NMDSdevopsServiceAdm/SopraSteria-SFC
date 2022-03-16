const Sequelize = require('sequelize');
const redis = require('redis');
const moment = require('moment');
const appConfig = require('../../config/config');

const sqldb = {};
const config = {};

const rc = redis.createClient(config.url);

rc.on('connect', () => console.log('Connected to Redis!'));
rc.on('error', (err) => console.log('Redis Client Error', err));
rc.connect();

config.host = appConfig.get('sqldb.host');
config.port = appConfig.get('sqldb.port');
config.database = appConfig.get('sqldb.database');
config.username = appConfig.get('sqldb.username');
config.password = appConfig.get('sqldb.password');
config.url = appConfig.get('redis.url');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
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
  const todayDate = moment().format('DD-MM-YYYY');
  const cacheKey = `dailyCash_${todayDate}`;

  if (await rc.exists(cacheKey)) {
    return JSON.parse(await rc.get(cacheKey));
  } else {
    const quals = await Qualification.findAll();

    await rc.set(cacheKey, JSON.stringify(quals));
    rc.expire(cacheKey, 86400);
    return quals;
  }
};

(async () => {
  await findAllQuals();
})();

sqldb.sequelize = sequelize;
sqldb.Sequelize = Sequelize;

module.exports = sqldb;
