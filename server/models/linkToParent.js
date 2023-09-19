/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const LinkToParent = sequelize.define(
    'LinkToParent',
    {
      linkToParentUid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: '"LinkToParentUID"',
      },
      parentEstablishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"ParentEstablishmentID"',
      },
      subEstablishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"SubEstablishmentID"',
      },
      permissionRequest: {
        type: DataTypes.ENUM,
        values: ['Workplace and Staff', 'Workplace', 'None'],
        allowNull: false,
        field: '"PermissionRequest"',
      },
      approvalStatus: {
        type: DataTypes.ENUM,
        values: ['REQUESTED', 'APPROVED', 'DENIED', 'CANCELLED'],
        allowNull: false,
        field: '"ApprovalStatus"',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"RejectionReason"',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"Created"',
      },
      createdByUserUid: {
        type: DataTypes.UUID,
        allowNull: false,
        field: '"CreatedByUserUID"',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"Updated"',
      },
      updatedByUserUid: {
        type: DataTypes.UUID,
        allowNull: false,
        field: '"UpdatedByUserUID"',
      },
    },
    {
      tableName: '"LinkToParent"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  LinkToParent.associate = (models) => {
    LinkToParent.belongsTo(models.establishment, {
      foreignKey: 'ParentEstablishmentID',
      targetKey: 'id',
      as: 'ParentEstablishment',
    });
  };

  LinkToParent.getLinkToParentUid = async function (establishmentId) {
    return await this.findOne({
      where: {
        subEstablishmentId: establishmentId,
        approvalStatus: 'REQUESTED',
      },
      attributes: ['LinkToParentUID'],
    });
  };

  LinkToParent.getLinkToParentRequestDetails = async function (linkToParentUid) {
    return await this.findOne({
      attributes: ['ApprovalStatus', 'PermissionRequest', 'SubEstablishmentID'],
      include: [
        {
          model: sequelize.models.establishment,
          as: 'ParentEstablishment',
          attributes: ['EstablishmentID', 'PostCode', 'NameValue'],
          required: true,
        },
      ],
      where: {
        linkToParentUid: linkToParentUid,
      },
    });
  };

  return LinkToParent;
};
