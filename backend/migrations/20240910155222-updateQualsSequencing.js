'use strict';

const { Op } = require('sequelize');
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
const qualsGroups = [
  { name: 'Apprenticeship', standardSeq: 0, specifiedSequences: [{ id: 133, seq: 1 }] },
  {
    name: 'Award',
    standardSeq: 0,
    specifiedSequences: [
      { id: 24, seq: 1 },
      { id: 25, seq: 2 },
      { id: 26, seq: 3 },
      { id: 27, seq: 4 },
      { id: 28, seq: 5 },
    ],
  },
  {
    name: 'Certificate',
    standardSeq: 1,
    specifiedSequences: [
      { id: 152, seq: 0 },
      { id: 134, seq: 2 },
      { id: 135, seq: 3 },
    ],
  },
  {
    name: 'Degree',
    standardSeq: 0,
    specifiedSequences: [{ id: 147, seq: 1 }],
  },
  {
    name: 'Diploma',
    standardSeq: 0,
    specifiedSequences: [
      { id: 90, seq: 1 },
      { id: 91, seq: 2 },
    ],
  },
  {
    name: 'NVQ',
    standardSeq: 0,
    specifiedSequences: [{ id: 99, seq: 1 }],
  },
  {
    name: 'Other type of qualification',
    standardSeq: 0,
    specifiedSequences: [
      { id: 117, seq: 1 },
      { id: 118, seq: 2 },
      { id: 113, seq: 3 },
      { id: 119, seq: 4 },
    ],
  },
];

const getIdsWithDifferentSequencing = (qualificationGroup) =>
  qualificationGroup.specifiedSequences.map((qualification) => qualification.id);

module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const qualGroup of qualsGroups) {
        for (const qualification of qualGroup.specifiedSequences) {
          await models.workerAvailableQualifications.update(
            {
              seq: qualification.seq,
            },
            {
              where: {
                id: qualification.id,
              },
              transaction,
            },
          );
        }

        const idsInGroupWithDifferentSequencing = getIdsWithDifferentSequencing(qualGroup);

        await models.workerAvailableQualifications.update(
          {
            seq: qualGroup.standardSeq,
          },
          {
            where: {
              group: qualGroup.name,
              id: {
                [Op.notIn]: idsInGroupWithDifferentSequencing,
              },
            },
            transaction,
          },
        );
      }
    });
  },

  async down(queryInterface) {
    const originalQualificationSequencing = [
      { id: 1, seq: 10 },
      { id: 2, seq: 20 },
      { id: 3, seq: 30 },
      { id: 4, seq: 40 },
      { id: 5, seq: 50 },
      { id: 6, seq: 60 },
      { id: 7, seq: 70 },
      { id: 8, seq: 80 },
      { id: 9, seq: 90 },
      { id: 10, seq: 100 },
      { id: 12, seq: 120 },
      { id: 13, seq: 130 },
      { id: 14, seq: 140 },
      { id: 15, seq: 150 },
      { id: 16, seq: 160 },
      { id: 17, seq: 170 },
      { id: 18, seq: 180 },
      { id: 19, seq: 190 },
      { id: 20, seq: 200 },
      { id: 21, seq: 210 },
      { id: 22, seq: 220 },
      { id: 23, seq: 230 },
      { id: 24, seq: 240 },
      { id: 27, seq: 270 },
      { id: 28, seq: 280 },
      { id: 30, seq: 290 },
      { id: 31, seq: 300 },
      { id: 32, seq: 310 },
      { id: 33, seq: 320 },
      { id: 34, seq: 330 },
      { id: 35, seq: 340 },
      { id: 36, seq: 350 },
      { id: 37, seq: 360 },
      { id: 38, seq: 370 },
      { id: 39, seq: 380 },
      { id: 40, seq: 390 },
      { id: 41, seq: 400 },
      { id: 42, seq: 410 },
      { id: 43, seq: 420 },
      { id: 44, seq: 430 },
      { id: 45, seq: 440 },
      { id: 47, seq: 450 },
      { id: 48, seq: 460 },
      { id: 49, seq: 470 },
      { id: 50, seq: 480 },
      { id: 51, seq: 490 },
      { id: 52, seq: 500 },
      { id: 53, seq: 510 },
      { id: 54, seq: 520 },
      { id: 55, seq: 530 },
      { id: 56, seq: 540 },
      { id: 57, seq: 550 },
      { id: 58, seq: 560 },
      { id: 59, seq: 570 },
      { id: 60, seq: 580 },
      { id: 61, seq: 590 },
      { id: 62, seq: 600 },
      { id: 63, seq: 610 },
      { id: 64, seq: 620 },
      { id: 65, seq: 630 },
      { id: 66, seq: 640 },
      { id: 67, seq: 650 },
      { id: 68, seq: 660 },
      { id: 93, seq: 880 },
      { id: 94, seq: 890 },
      { id: 95, seq: 900 },
      { id: 132, seq: 1240 },
      { id: 137, seq: 1260 },
      { id: 138, seq: 1270 },
      { id: 121, seq: 1130 },
      { id: 122, seq: 1140 },
      { id: 123, seq: 1150 },
      { id: 124, seq: 1160 },
      { id: 125, seq: 1170 },
      { id: 126, seq: 1180 },
      { id: 127, seq: 1190 },
      { id: 128, seq: 1200 },
      { id: 129, seq: 1210 },
      { id: 130, seq: 1220 },
      { id: 131, seq: 1230 },
      { id: 133, seq: 1250 },
      { id: 11, seq: 110 },
      { id: 25, seq: 250 },
      { id: 26, seq: 260 },
      { id: 69, seq: 670 },
      { id: 134, seq: 675 },
      { id: 135, seq: 676 },
      { id: 71, seq: 680 },
      { id: 72, seq: 690 },
      { id: 136, seq: 685 },
      { id: 74, seq: 700 },
      { id: 76, seq: 720 },
      { id: 77, seq: 730 },
      { id: 78, seq: 740 },
      { id: 79, seq: 750 },
      { id: 80, seq: 760 },
      { id: 81, seq: 770 },
      { id: 82, seq: 780 },
      { id: 83, seq: 790 },
      { id: 84, seq: 800 },
      { id: 85, seq: 810 },
      { id: 86, seq: 820 },
      { id: 87, seq: 830 },
      { id: 90, seq: 860 },
      { id: 91, seq: 870 },
      { id: 89, seq: 850 },
      { id: 96, seq: 910 },
      { id: 97, seq: 920 },
      { id: 98, seq: 930 },
      { id: 99, seq: 940 },
      { id: 100, seq: 950 },
      { id: 102, seq: 960 },
      { id: 106, seq: 1000 },
      { id: 107, seq: 1010 },
      { id: 103, seq: 970 },
      { id: 104, seq: 980 },
      { id: 105, seq: 990 },
      { id: 109, seq: 1020 },
      { id: 110, seq: 1030 },
      { id: 111, seq: 1040 },
      { id: 112, seq: 1050 },
      { id: 117, seq: 1100 },
      { id: 118, seq: 1110 },
      { id: 119, seq: 1120 },
      { id: 113, seq: 1060 },
      { id: 114, seq: 1070 },
      { id: 116, seq: 1090 },
      { id: 115, seq: 1080 },
      { id: 75, seq: 710 },
      { id: 88, seq: 840 },
      { id: 139, seq: 0 },
      { id: 140, seq: 0 },
      { id: 141, seq: 0 },
      { id: 152, seq: 0 },
      { id: 142, seq: 0 },
      { id: 143, seq: 0 },
      { id: 144, seq: 0 },
      { id: 145, seq: 0 },
      { id: 146, seq: 0 },
      { id: 147, seq: 0 },
      { id: 148, seq: 0 },
      { id: 149, seq: 0 },
      { id: 150, seq: 0 },
      { id: 151, seq: 0 },
    ];

    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const qualification of originalQualificationSequencing) {
        await models.workerAvailableQualifications.update(
          {
            seq: qualification.seq,
          },
          {
            where: {
              id: qualification.id,
            },
            transaction,
          },
        );
      }
    });
  },
};
