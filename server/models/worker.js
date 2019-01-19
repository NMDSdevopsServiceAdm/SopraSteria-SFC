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
    NameOrIdValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      len: [0,50],
      field: '"NameOrIdValue"'
    },
    NameOrIdSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameOrIdSavedAt"'
    },
    NameOrIdChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameOrIdChangedAt"'
    },
    NameOrIdSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameOrIdSavedBy"'
    },
    NameOrIdChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameOrIdChangedBy"'
    },
    ContractValue: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'],
      field: '"ContractValue"'
    },
    ContractSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ContractSavedAt"'
    },
    ContractChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ContractChangedAt"'
    },
    ContractSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ContractSavedBy"'
    },
    ContractChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ContractChangedBy"'
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
    GenderValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Female', 'Male', 'Other', 'Don\'t know'],
      field: '"GenderValue"'
    },
    GenderSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"GenderSavedAt"'
    },
    GenderChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"GenderChangedAt"'
    },
    GenderSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"GenderSavedBy"'
    },
    GenderChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"GenderChangedBy"'
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
    Worker.hasMany(models.workerAudit, {
      foreignKey: 'workerFk',
      sourceKey: 'id',
      as: 'auditEvents'
    })
  };

  return Worker;
};
