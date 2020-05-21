'use strict';
module.exports = (sequelize, DataTypes) => {
  const Approvals = sequelize.define('approvals', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UUID: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    EstablishmentID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ApprovalType: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['BecomeAParent'],
    },
    Status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Pending', 'Approved', 'Rejected'],
      defaultValue: 'Pending'
    },
    RejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    tableName: 'Approvals',
    schema: 'cqc'
  });

  Approvals.associate = (models) => {
    Approvals.belongsTo(models.user, {
      foreignKey : 'UserID',
      targetKey: 'id',
    });

    Approvals.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentID',
      targetKey: 'id',
      as: 'establishments',
    });
  };

  return Approvals;
};
