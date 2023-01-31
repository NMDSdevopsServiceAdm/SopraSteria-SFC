/* jshint indent: 2 */

const moment = require('moment');
const { Op } = require('sequelize');

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

  WorkerTraining.fetchTrainingForEstablishment = async function (
    establishmentId,
    trainingCategoryId,
    // limit = 0,
    pageIndex = 0,
    sortBy = '',
    searchTerm = '',
  ) {
    const count =
      await sequelize.query(`SELECT count("worker"."ID") AS "count" FROM "cqc"."WorkerTraining" AS "workerTraining" RIGHT OUTER JOIN "cqc"."Worker" AS "worker" ON "workerTraining"."WorkerFK" = "worker"."ID" AND "workerTraining"."CategoryFK" = '1' WHERE "worker"."EstablishmentFK" = '1686' AND "worker"."Archived" = false;
    `);

    const category = await sequelize.models.workerTrainingCategories.findOne({
      where: {
        id: trainingCategoryId,
      },
      attributes: ['category'],
    });
    const limit = 0;
    const currentDate = moment().toISOString();
    const expiresSoonAlertDate = await sequelize.models.establishment.getExpiresSoonAlertDate(establishmentId);
    const expiresSoon = moment().add(expiresSoonAlertDate.get('ExpiresSoonAlertDate'), 'days').toISOString();
    const offset = pageIndex * limit;

    const pagination = {
      subQuery: false,
      limit,
      offset,
    };

    const trainingAttributes = [
      'id',
      'uid',
      'completed',
      'expires',
      'title',
      'categoryFk',
      [
        sequelize.literal(
          `CASE
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 'Expires soon'
            WHEN "Expires" < '${currentDate}' THEN 'Expired'
            WHEN "CategoryFK" IS NULL THEN 'Missing'
            ELSE 'OK'
          END`,
        ),
        'status',
      ],
      [
        sequelize.literal(
          `CASE
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 3
            WHEN "Expires" < '${currentDate}' THEN 2
            WHEN "CategoryFK" IS NULL THEN 1
            ELSE 0
          END`,
        ),
        'sortByExpiresSoon',
      ],

      [
        sequelize.literal(
          `CASE
            WHEN "Expires" < '${currentDate}' THEN 3
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 2
            WHEN "CategoryFK" IS NULL THEN 1
            ELSE 0
          END`,
        ),
        'sortByExpired',
      ],
      [
        sequelize.literal(
          `CASE
            WHEN "CategoryFK" IS NULL THEN 3
            WHEN "Expires" < '${currentDate}' THEN 2
            WHEN "Expires" BETWEEN '${currentDate}' AND '${expiresSoon}' THEN 1
            ELSE 0
          END`,
        ),
        'sortByMissing',
      ],
    ];

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

    const response = await this.findAll({
      attributes: trainingAttributes,
      where: {
        '$worker.EstablishmentFK$': establishmentId,
        '$worker.Archived$': false,
        ...(searchTerm ? { '$worker.NameOrIdValue$': { [Op.iLike]: `%${searchTerm}%` } } : {}),
      },
      include: [
        {
          model: sequelize.models.worker,
          as: 'worker',
          attributes: ['id', 'uid', 'NameOrIdValue'],
          on: {
            col1: sequelize.where(sequelize.col('workerTraining.WorkerFK'), '=', sequelize.col('worker.ID')),
            col2: sequelize.where(sequelize.col('workerTraining.CategoryFK'), '=', trainingCategoryId),
          },
          right: true,
          include: [
            {
              model: sequelize.models.job,
              as: 'mainJob',
              attributes: ['title', 'id'],
            },
          ],
        },
      ],

      order,
      ...(limit ? pagination : {}),
    });

    return { count: +count[0][0].count, rows: response, category };
  };

  return WorkerTraining;
};
