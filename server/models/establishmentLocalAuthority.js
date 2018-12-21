/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const EstablishmentLocalAuthority = sequelize.define('establishmentLocalAuthority', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"EstablishmentLocalAuthority"'
    },
    authorityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"LocalCustodianCode"'
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentID"'
    }
  }, {
    tableName: '"EstablishmentLocalAuthority"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  EstablishmentLocalAuthority.associate = (models) => {
    EstablishmentLocalAuthority.belongsTo(models.localAuthority, {
      foreignKey: 'authorityId',
      targetKey: 'id',
      as: 'reference'
    });
  };

  return EstablishmentLocalAuthority;
};
