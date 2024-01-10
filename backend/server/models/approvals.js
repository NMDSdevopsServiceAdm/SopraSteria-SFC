'use strict';

const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Approvals = sequelize.define(
    'Approvals',
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      UUID: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      EstablishmentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ApprovalType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['BecomeAParent', 'CqcStatusChange'],
      },
      Status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Pending', 'Approved', 'Rejected', 'In progress'],
        defaultValue: 'Pending',
      },
      RejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      Reviewer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      InReview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: 'Approvals',
      schema: 'cqc',
    },
  );

  Approvals.associate = (models) => {
    Approvals.belongsTo(models.user, {
      foreignKey: 'UserID',
      targetKey: 'id',
      as: 'User',
    });

    Approvals.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentID',
      targetKey: 'id',
      as: 'Establishment',
    });
  };

  Approvals.findAllPendingAndInProgress = function (approvalType) {
    return this.findAll({
      where: {
        ApprovalType: approvalType,
        Status: { [Op.or]: ['Pending', 'In progress'] },
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status', 'Data'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['uid', 'nmdsId', 'NameValue'],
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  };

  Approvals.findbyId = function (id) {
    return this.findOne({
      where: {
        ID: id,
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status', 'Data'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['nmdsId', 'NameValue'],
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue'],
        },
      ],
    });
  };

  Approvals.findbyUuid = function (uuid) {
    return this.findOne({
      where: {
        UUID: uuid,
      },
      attributes: ['ID', 'UUID', 'EstablishmentID', 'UserID', 'createdAt', 'Status'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: ['nmdsId', 'NameValue'],
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue'],
        },
      ],
    });
  };
  Approvals.findbyEstablishmentId = function (establishmentId, approvalType, status) {
    let params;
    if (status) {
      params = status != 'Pending' ? status : { [Op.or]: ['Pending', 'In progress'] };
    } else {
      params = { [Op.or]: ['Pending', 'In progress'] };
    }
    return this.findOne({
      where: {
        EstablishmentID: establishmentId,
        ApprovalType: approvalType,
        Status: params,
      },
      attributes: [
        'ID',
        'UUID',
        'EstablishmentID',
        'UserID',
        'createdAt',
        'Status',
        'Data',
        'Reviewer',
        'InReview',
        'createdAt',
      ],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'Establishment',
          attributes: [
            'id',
            'uid',
            'nmdsId',
            'NameValue',
            'address1',
            'address2',
            'address3',
            'postcode',
            'town',
            'county',
          ],
        },
        {
          model: sequelize.models.user,
          as: 'User',
          attributes: ['FullNameValue', 'RegistrationID'],
        },
      ],
    });
  };

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
        ApprovalType: 'BecomeAParent',
      },
      include: [
        {
          model: sequelize.models.establishment,
          attributes: ['isParent'],
          as: 'Establishment',
        },
      ],
    });

    if (latest === null) {
      return true;
    }

    if (latest.Status === 'Rejected') {
      return true;
    }

    if (latest.Status === 'Approved' && latest.Establishment.isParent === false) {
      return true;
    }

    return false;
  };

  Approvals.becomeAParentRequests = async function (establishmentId) {
    return await this.findOne({
      where: {
        EstablishmentID: establishmentId,
        Status: 'Pending',
        ApprovalType: 'BecomeAParent',
      },
      order: [['createdAt', 'DESC']],
    });
  };

  Approvals.deleteParentRequest = async function (establishmentId) {
    return await this.destroy({
      where: {
        EstablishmentID: establishmentId,
      },
    });
  };

  return Approvals;
};
