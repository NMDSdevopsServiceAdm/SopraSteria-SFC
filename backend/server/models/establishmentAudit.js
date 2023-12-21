module.exports = function(sequelize, DataTypes) {
  const EstablishmentAudit = sequelize.define('establishmentAudit', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    establishmentFk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentFK"'
    },
    username : {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Username"'
    },
    when: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: '"When"'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['created', 'updated', 'saved', 'changed', 'delete', 'overalWdfEligible', 'wdfEligible', 'staffWdfEligible', 'establishmentWdfEligible'],
      field: '"EventType"'
    },
    property : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PropertyName"'
    },
    event : {
      type: DataTypes.JSONB,
      allowNull: true,
      field: '"ChangeEvents"'
    }
  }, {
    tableName: '"EstablishmentAudit"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false,    // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
  });

  return EstablishmentAudit;
};
