/* jshint indent: 2 */
const moment = require('moment');
const { QueryTypes } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const WorkerTraining = sequelize.define(
    'workerTraining',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"UID"',
      },
      workerFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerFK"',
      },
      source: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Online', 'Bulk'],
        default: 'Online',
        field: '"DataSource"',
      },
      categoryFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"CategoryFK"',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Title"',
      },
      accredited: {
        type: DataTypes.ENUM,
        values: ['Yes', 'No', "Don't know"],
        allowNull: true,
        field: '"Accredited"',
      },
      completed: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Completed"',
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Expires"',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Notes"',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'updatedby',
      },
    },
    {
      tableName: 'WorkerTraining',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  WorkerTraining.associate = (models) => {
    WorkerTraining.belongsTo(models.worker, {
      foreignKey: 'workerFk',
      targetKey: 'id',
      as: 'worker',
    });
    WorkerTraining.belongsTo(models.workerTrainingCategories, {
      foreignKey: 'categoryFk',
      targetKey: 'id',
      as: 'category',
    });
  };

  WorkerTraining.fetchTrainingByCategoryForEstablishment = async function (
    establishmentId,
    trainingCategoryId,
    limit = 0,
    pageIndex = 0,
    sortBy = '',
    searchTerm = '',
  ) {
    const addSearchToCount = searchTerm ? `AND "NameOrIdValue" ILIKE '%${searchTerm}%'` : '';

    const category = await sequelize.models.workerTrainingCategories.findOne({
      where: {
        id: trainingCategoryId,
      },
      attributes: ['category'],
    });

    const currentDate = moment().toISOString();
    const expiresSoonAlertDate = await sequelize.models.establishment.getExpiresSoonAlertDate(establishmentId);
    const expiresSoon = moment().add(expiresSoonAlertDate.get('ExpiresSoonAlertDate'), 'days').toISOString();
    const offset = pageIndex * limit;

    const pagination = {
      subQuery: false,
      limit,
      offset,
    };

    const status = `CASE
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 'Expires soon'
            WHEN "Expires" < '${currentDate}' THEN 'Expired'
            WHEN "CategoryFK" IS NULL THEN 'Missing'
            ELSE 'OK'
          END AS "status"`;

    const sortByExpiresSoon = `CASE
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 3
            WHEN "Expires" < '${currentDate}' THEN 2
            WHEN "CategoryFK" IS NULL THEN 1
            ELSE 0
          END AS "sortByExpiresSoon"`;

    const sortByExpired = `CASE
            WHEN "Expires" < '${currentDate}' THEN 3
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 2
            WHEN "CategoryFK" IS NULL THEN 1
            ELSE 0
          END AS "sortByExpired"`;

    const sortByMissing = `CASE
            WHEN "CategoryFK" IS NULL THEN 3
            WHEN "Expires" < '${currentDate}' THEN 2
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 1
            ELSE 0
          END AS "sortByMissing"`;

    const select = `
          SELECT
          w2."WorkerTrainingId" AS id,
          w2."WorkerTrainingUid" AS uid,
          w2."Completed" AS "completed",
          w2."Expires" AS "expires",
          w2."Title" AS "title",
          w2."CategoryFK",
          COALESCE(w1."WorkerId1", w2."WorkerId2") AS "workerId",
          COALESCE(w1."WorkerUID1", w2."WorkerUID2") AS "workerUid",
          COALESCE(w1."NameOrIdValue1", w2."NameOrIdValue2") AS "NameOrIdValue",
          COALESCE(w1."JobName1", w2."JobName2") AS "jobTitle",
          COALESCE(w1."JobID1", w2."JobID2") AS "jobFK",
          ${status},
          ${sortByExpiresSoon},
          ${sortByExpired},
          ${sortByMissing}`;

    const from = `FROM (
            SELECT w."ID" AS "WorkerId1", w."WorkerUID" AS "WorkerUID1", w."NameOrIdValue" AS "NameOrIdValue1", j."JobName" AS "JobName1", j."JobID" AS "JobID1", mt."ID" AS "MandatoryTrainingId", w."EstablishmentFK" AS "EstablishmentFK1", mt."TrainingCategoryFK", mt."JobFK"
            FROM cqc."MandatoryTraining" mt
            RIGHT OUTER JOIN cqc."Worker" w ON mt."EstablishmentFK" = w."EstablishmentFK" AND mt."JobFK" = w."MainJobFKValue"
            LEFT OUTER JOIN cqc."Job" j ON w."MainJobFKValue" = j."JobID"
            WHERE w."EstablishmentFK" = ${establishmentId} AND "TrainingCategoryFK" = ${trainingCategoryId}
            AND w."Archived" = false
            ) w1
          FULL OUTER JOIN (
            SELECT w."ID" AS "WorkerId2", wt."ID" AS "WorkerTrainingId", wt."UID" AS "WorkerTrainingUid", w."WorkerUID" AS "WorkerUID2", w."NameOrIdValue" AS "NameOrIdValue2", j."JobName" AS "JobName2", j."JobID" AS "JobID2" , wt."Title", wt."Completed", wt."Expires", wt."CategoryFK", w."EstablishmentFK" AS "EstablishmentFK2"
            FROM cqc."WorkerTraining" wt
            RIGHT OUTER JOIN cqc."Worker" w ON wt."WorkerFK" = w."ID"
            LEFT OUTER JOIN cqc."Job" j ON w."MainJobFKValue" = j."JobID"
            WHERE w."EstablishmentFK" = ${establishmentId} AND wt."CategoryFK" = ${trainingCategoryId}
            AND w."Archived" = false
            ) w2
          ON w1."WorkerUID1" = w2."WorkerUID2"`

        // Get count of training by category
    const count = await sequelize.query(`
      SELECT count(COALESCE(w1."WorkerUID1", w2."WorkerUID2")) AS "count"
      ${from}
      ${addSearchToCount}
    `);

    const order = {
      staffNameAsc: [['worker', 'NameOrIdValue', 'ASC']],
      trainingExpired: [
        [sequelize.literal('"sortByExpired"'), 'DESC'],
        ['worker', 'NameOrIdValue', 'ASC'],
      ],
      trainingExpiringSoon: [
        [sequelize.literal('"sortByExpiresSoon"'), 'DESC'],
        ['worker', 'NameOrIdValue', 'ASC'],
      ],
      trainingMissing: [
        [sequelize.literal('"sortByMissing"'), 'DESC'],
        ['worker', 'NameOrIdValue', 'ASC'],
      ],
    }[sortBy] || [['worker', 'NameOrIdValue', 'ASC']];

    const trainingResponse = await sequelize.query(`
      ${select} ${from}`, {type: QueryTypes.SELECT});

    const response = trainingResponse.map(training => ({
      id: training.id,
      uid: training.uid,
      completed: training.completed,
      expires: training.expires,
      title: training.title,
      categoryFK: training.categoryFK,
      status: training.status,
      sortByExpiresSoon: training.sortByExpiresSoon,
      sortByExpired: training.sortByExpired,
      sortByMissing: training.sortByMissing,
      worker: {
        id: training.workerId,
        uid: training.workerUid,
        NameOrIdValue: training.NameOrIdValue,
        mainJob: {
          title: training.jobTitle,
          id: training.jobFK
        }
      }
    }));

    return { count: +count[0][0].count, rows: response, category };
  };

  return WorkerTraining;
};
