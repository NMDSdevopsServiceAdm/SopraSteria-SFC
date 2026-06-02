'use strict';

const table = { tableName: 'TrainingProvider', schema: 'cqc' };

const providerToRename = {
  ID: 31,
  BulkUploadCode: 31,
  NewName: 'Tend Training',
  OldName: 'Impact Futures Training Limited',
};

const newTrainingProviders = [
  { ID: 64, BulkUploadCode: 63, Name: 'A1 Education and Training' },
  {
    ID: 65,
    BulkUploadCode: 64,
    Name: 'Adada Recruitment and Training Services (arts) Ltd',
  },
  { ID: 66, BulkUploadCode: 65, Name: 'ASH Healthcare Training' },
  { ID: 67, BulkUploadCode: 66, Name: 'Blackburn College' },
  { ID: 68, BulkUploadCode: 67, Name: 'Bluebird Care Franchises Ltd' },
  {
    ID: 69,
    BulkUploadCode: 68,
    Name: 'British Institute of Learning Disabilities',
  },
  { ID: 70, BulkUploadCode: 69, Name: 'BSol ICB OMMT Team' },
  { ID: 71, BulkUploadCode: 70, Name: 'Caring Alliance' },
  { ID: 72, BulkUploadCode: 71, Name: 'Dynamic Training UK Ltd' },
  { ID: 73, BulkUploadCode: 72, Name: 'Edify Consultancy Ltd' },
  { ID: 74, BulkUploadCode: 73, Name: 'FuturU' },
  {
    ID: 75,
    BulkUploadCode: 74,
    Name: 'Gateshead Council - Learning and Skills',
  },
  { ID: 76, BulkUploadCode: 75, Name: 'L&F Training Ltd' },
  { ID: 77, BulkUploadCode: 76, Name: 'Lancaster and Morecambe College' },
  { ID: 78, BulkUploadCode: 77, Name: 'Medex Group Ltd' },
  { ID: 79, BulkUploadCode: 78, Name: 'National Star' },
  { ID: 80, BulkUploadCode: 79, Name: 'Neurodiverse Training' },
  { ID: 81, BulkUploadCode: 80, Name: 'Pathway First Limited' },
  { ID: 82, BulkUploadCode: 81, Name: 'Retain skills' },
  { ID: 83, BulkUploadCode: 82, Name: 'Rochdale Training' },
  { ID: 84, BulkUploadCode: 83, Name: 'Saracen Care Services Ltd' },
  { ID: 85, BulkUploadCode: 84, Name: 'Shreeji Training Ltd' },
  { ID: 86, BulkUploadCode: 85, Name: 'The EdgeWorks Limited' },
  { ID: 87, BulkUploadCode: 86, Name: 'The Link Training Academy' },
  { ID: 88, BulkUploadCode: 87, Name: 'Tutorcare Ltd' },
  { ID: 89, BulkUploadCode: 88, Name: 'Skills for Care' },
];

const dataAsSqlStatements = newTrainingProviders.map((row) => {
  return `(${row.ID}, '${row.Name}', ${row.BulkUploadCode}, '${row.IsOther ?? false}')`;
});

const insertStatement = `INSERT INTO cqc."${table.tableName}"
       ("ID", "Name", "BulkUploadCode", "IsOther")
        VALUES
      ${dataAsSqlStatements.join(', ')};`;

const deleteStatement = `DELETE FROM cqc."${table.tableName}"
     WHERE "ID" IN (${newTrainingProviders.map((provider) => provider.ID).join(', ')});`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const rename = queryInterface.sequelize.query(
        `UPDATE cqc."${table.tableName}"
        SET "Name" = '${providerToRename.NewName}'
        WHERE "ID" = ${providerToRename.ID};`,
        { transaction },
      );

      const addNewProviders = queryInterface.sequelize.query(insertStatement, { transaction });

      return Promise.all([rename, addNewProviders]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      const undoRename = queryInterface.sequelize.query(
        `
        UPDATE cqc."${table.tableName}"
        SET "Name" = '${providerToRename.OldName}'
        WHERE "ID" = ${providerToRename.ID};`,
        { transaction },
      );

      const removeNewProviders = queryInterface.sequelize.query(deleteStatement, { transaction });

      return Promise.all([undoRename, removeNewProviders]);
    });
  },
};
