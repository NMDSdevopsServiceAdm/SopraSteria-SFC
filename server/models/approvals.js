'use strict';
module.exports = (sequelize, DataTypes) => {
  const Approvals = sequelize.define('Approvals', {
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
      as: 'User',
    });

    Approvals.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentID',
      targetKey: 'id',
      as: 'Establishment',
    });
  };

  Approvals.findAllPending = function(approvalType) {
    return this.findAll({
      where: {
        ApprovalType: approvalType,
        Status: 'Pending'
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['uid', 'nmdsId', 'NameValue']
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue']
        }
      ]
    });
  }

  Approvals.findbyId = function(id) {
    return this.findOne({
      where: {
        ID: id
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['nmdsId', 'NameValue']
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue']
        }
      ]
    });
  }

  Approvals.findbyUuid = function(uuid) {
    return this.findOne({
      where: {
        UUID: uuid
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['nmdsId', 'NameValue']
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue']
        }
      ]
    });
  }

  Approvals.createBecomeAParentRequest = function (userId, establishmentId) {
    return this.create({
        UserID: userId,
        EstablishmentID: establishmentId,
        ApprovalType: 'BecomeAParent',
    });
  };

  Approvals.canRequestToBecomeAParent = async function (establishmentId) {
    const latest = await this.findOne({
      where: {
        EstablishmentID: establishmentId,
        ApprovalType: 'BecomeAParent'
      },
      order: [
        ['createdAt', 'DESC']
      ],
    });

    if (latest === null) {
      return true;
    }

    if (latest.Status === 'Rejected') {
      return true;
    }

    return false;
  };

  return Approvals;
};
