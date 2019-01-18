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
      allowNull: false,
      unique: true,
      len: [0,50],
      field: '"NameOrID"'
    },
    contract: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'],
      field: '"Contract"'
    },
    mainJobFk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"MainJobFK"'
    },
    approvedMentalHealthWorker : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', 'Don\'t know'],
      field: '"ApprovedMentalHealthWorker"'
    },
    mainJobStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobStartDate"'
    },
    nationalInsuranceNumber: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalInsuranceNumber"'
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DateOfBirth"'
    },
    postcode: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Postcode"'
    },
    gender : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Female', 'Male', 'Other', 'Don\'t know'],
      field: '"GenderValue"'
    },
    disability : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', 'Undisclosed', 'Don\'t know'],
      field: '"Disability"'
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
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'updatedby'
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
