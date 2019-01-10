module.exports = function(sequelize, DataTypes) {
  const Worker = sequelize.define('worker', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: '"WorkerUID"'
    },
    establishmentFk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentFK"'
    },
    nameId: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
      len: [0,50],
      field: '"NameOrID"'
    },
    contract: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'],
      field: '"Contract"'
    },
    mainJobFk : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"MainJobFK"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated'
    }
  }, {
    tableName: '"Worker"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false,    // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    uniqueKeys: {
      nameId_unique: {
        fields: ['establishmentFk', 'nameId']
      }
    }
  });

  Worker.associate = (models) => {
    Worker.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment'
    });
    Worker.belongsTo(models.job, {
      foreignKey: 'mainJobFk',
      targetKey: 'id',
      as: 'mainJob'
    });
  };

  return Worker;
};
