'use strict';

/** @type {import('sequelize-cli').Migration} */

const table = { tableName: 'TrainingProvider', schema: 'cqc' };

const trainingProviders = [
  { id: 1, bulkUploadCode: 1, name: '1Stop Training' },
  { id: 2, bulkUploadCode: 2, name: 'AASOG Education and Training' },
  { id: 3, bulkUploadCode: 3, name: 'Access Skills Ltd' },
  { id: 4, bulkUploadCode: 4, name: 'Adams Care Training Ltd' },
  { id: 5, bulkUploadCode: 5, name: 'Alium Care Training' },
  {
    id: 6,
    bulkUploadCode: 6,
    name: 'AreYou - Training and Consultancy CIC',
  },
  { id: 7, bulkUploadCode: 7, name: 'Autism Together' },
  { id: 8, bulkUploadCode: 8, name: 'Award Training Limited' },
  {
    id: 9,
    bulkUploadCode: 9,
    name: 'Bespoke Consultancy and Education',
  },
  { id: 10, bulkUploadCode: 10, name: 'Centra Training' },
  { id: 11, bulkUploadCode: 11, name: 'Cera Care' },
  { id: 12, bulkUploadCode: 12, name: 'Coleman Training Ltd' },
  { id: 13, bulkUploadCode: 13, name: 'Crossroads Barnsley Ltd' },
  { id: 14, bulkUploadCode: 14, name: 'DH Associates' },
  { id: 15, bulkUploadCode: 15, name: 'Distinction Solutions' },
  { id: 16, bulkUploadCode: 16, name: 'Dominion Consultancy Group' },
  { id: 17, bulkUploadCode: 17, name: 'DurhamLearn' },
  { id: 18, bulkUploadCode: 18, name: 'Empeiria Training' },
  { id: 19, bulkUploadCode: 19, name: 'Estia Centre' },
  {
    id: 20,
    bulkUploadCode: 20,
    name: 'Experts by Experience Solihull CIC',
  },
  {
    id: 21,
    bulkUploadCode: 21,
    name: 'First Response Training and Consultancy Services Limited',
  },
  { id: 22, bulkUploadCode: 22, name: 'Flourish' },
  { id: 23, bulkUploadCode: 23, name: 'Freebird associates' },
  {
    id: 24,
    bulkUploadCode: 24,
    name: 'Guardian Angels Training (Stewart Hill Associates Limited, T/As Guardian Angels)',
  },
  { id: 25, bulkUploadCode: 25, name: 'Gecko programmes Ltd' },
  { id: 26, bulkUploadCode: 26, name: 'Glendale Academy' },
  { id: 27, bulkUploadCode: 27, name: 'Global Skills Services Ltd' },
  { id: 28, bulkUploadCode: 28, name: 'Hasca Ltd' },
  { id: 29, bulkUploadCode: 29, name: 'HCPA in partnership with CPA' },
  {
    id: 30,
    bulkUploadCode: 30,
    name: 'Howe2 Training & Consultancy Ltd',
  },
  {
    id: 31,
    bulkUploadCode: 31,
    name: 'Impact Futures Training Limited',
  },
  { id: 32, bulkUploadCode: 32, name: 'Inspire London College' },
  { id: 33, bulkUploadCode: 33, name: 'Inspiro Learning Ltd' },
  { id: 34, bulkUploadCode: 34, name: 'IPS International' },
  { id: 35, bulkUploadCode: 35, name: 'JAG Training Limited' },
  { id: 36, bulkUploadCode: 36, name: 'Leeds City Council' },
  { id: 37, bulkUploadCode: 37, name: 'Lifetime Training' },
  { id: 38, bulkUploadCode: 38, name: 'Luminate Education Group' },
  {
    id: 39,
    bulkUploadCode: 39,
    name: 'National Activity Providers Association',
  },
  { id: 40, bulkUploadCode: 40, name: 'National Care Forum' },
  {
    id: 41,
    bulkUploadCode: 41,
    name: 'Newcastle and Stafford Colleges Group',
  },
  { id: 42, bulkUploadCode: 42, name: 'Northbrook' },
  { id: 43, bulkUploadCode: 43, name: 'Pathways Associates CIC Ltd' },
  { id: 44, bulkUploadCode: 44, name: 'Pentagon Skills Limited' },
  {
    id: 45,
    bulkUploadCode: 45,
    name: 'Professional Training Solutions',
  },
  { id: 46, bulkUploadCode: 46, name: 'Realise' },
  { id: 47, bulkUploadCode: 47, name: 'Runway Training' },
  { id: 48, bulkUploadCode: 48, name: 'Social Works Ltd' },
  { id: 49, bulkUploadCode: 49, name: 'South West Skills Academy' },
  { id: 50, bulkUploadCode: 50, name: 'Step Up Training and Care' },
  { id: 51, bulkUploadCode: 51, name: 'Sutton Coldfield Training Ltd' },
  { id: 52, bulkUploadCode: 52, name: 'The Autism Wellbeing Project' },
  {
    id: 53,
    bulkUploadCode: 53,
    name: 'The Education Training Collective – Stockton Riverside College',
  },
  { id: 54, bulkUploadCode: 54, name: 'The Prime College' },
  { id: 55, bulkUploadCode: 55, name: 'The Sheffield College' },
  { id: 56, bulkUploadCode: 56, name: 'The United Care Network' },
  { id: 57, bulkUploadCode: 57, name: 'Training in Care Ltd.' },
  { id: 58, bulkUploadCode: 58, name: 'Unique Training Solutions Ltd' },
  {
    id: 59,
    bulkUploadCode: 59,
    name: 'United care networks Ta Brightpath academy',
  },
  {
    id: 60,
    bulkUploadCode: 60,
    name: 'Universal Vibes Limited Training As Care Trainings',
  },
  {
    id: 61,
    bulkUploadCode: 61,
    name: 'Vision Training (North East) Ltd',
  },
  { id: 62, bulkUploadCode: 62, name: 'Vita Training and Development' },
  { id: 63, bulkUploadCode: 999, name: 'other', isOther: true },
];

const dataAsSqlStatements = trainingProviders.map((row) => {
  return `(${row.id}, '${row.name}', '${row.bulkUploadCode}', '${row.isOther ?? false}')`;
});

const insertStatement = `INSERT INTO cqc."${table.tableName}"
       ("ID", "Name", "BulkUploadCode", "IsOther")
        VALUES
      ${dataAsSqlStatements.join(', ')};`;

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      const createTrainingProviderTable = queryInterface.createTable(
        table,
        {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          Name: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          BulkUploadCode: {
            type: Sequelize.INTEGER,
            unique: true,
            allowNull: false,
          },
          IsOther: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
        },
        { transaction },
      );

      const fillInData = () => queryInterface.sequelize.query(insertStatement, { transaction });

      return createTrainingProviderTable.then(fillInData);
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable(table);
  },
};
