/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const LocalAuthority = sequelize.define('localAuthority', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: '"LocalCustodianCode"'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"LocalAuthorityName"'
    }
  }, {
    tableName: '"LocalAuthority"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  return LocalAuthority;
};
