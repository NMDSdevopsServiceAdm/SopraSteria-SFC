'use strict';
const models = require('../server/models/index');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const qualGroups = {
        'Apprenticeship': [
          { id: 121, title: 'Adult care worker (standard)' },
          { id: 122, title: 'Lead adult care worker (standard)' },
          { id: 123, title: 'Advance apprenticeship in health and social care (framework)' },
          { id: 124, title: 'Degree registered nurse (standard)' },
          { id: 125, title: 'Degree social worker (standard)' },
          { id: 126, title: 'Higher apprenticeship in care leadership and management (framework)' },
          { id: 127, title: 'Intermediate apprenticeship in health and social care (framework)' },
          { id: 128, title: 'Lead practitioner in adult care (standard)' },
          { id: 129, title: 'Leader in adult care (standard)' },
          { id: 130, title: 'Nursing associate (standard)' },
          { id: 131, title: 'Occupational therapist' },
          { id: 133, title: 'Other apprenticeship framework or standard' }
        ],
        'Award': [
          { id: 1, title: "Advanced Award in Social Work (AASW)" },
          { id: 2, title: "Stroke Awareness" },
          { id: 3, title: "Supporting individuals with autism" },
          { id: 4, title: "Dementia" },
          { id: 5, title: "Awareness of dementia" },
          { id: 6, title: "Awareness of end of life care" },
          { id: 7, title: "Awareness of end of life care" },
          { id: 8, title: "Awareness of the mental capacity act, 2005" },
          { id: 9, title: "Basic awareness of diabetes" },
          { id: 10, title: "Emergency first aid at work" },
          { id: 11, title: "Employment Responsibilities and Rights in Health, Social Care, Children and Young People's settings" },
          { id: 12, title: "Food safety in health and social care, and early years and childcare settings" },
          { id: 13, title: "Introduction to health, social care, and children's and young people's settings" },
          { id: 14, title: "Mental Health Social Work Award (MHSWA)" },
          { id: 15, title: "Mentor award" },
          { id: 16, title: "Post Qualifying Award in Social Work (PQSW) Part 1" },
          { id: 17, title: "Preparing to work in adult social care" },
          { id: 18, title: "Promoting food safety and nutrition in health and social care or early years and childcare settings" },
          { id: 19, title: "Providing an induction into assisting and moving individuals in adult social care" },
          { id: 20, title: "Supporting activity provision in social care" },
          { id: 21, title: "Supporting individuals with learning disabilities" },
          { id: 22, title: "Supporting individuals with learning disabilities" },
          { id: 23, title: "Understanding working with people with mental health issues" },
          { id: 24, title: "Any Learning Disabled Awards Framework (LDAF) award" },
          { id: 27, title: "Other social care relevant award" },
          { id: 28, title: "Other non social care relevant award" },
          { id: 25, title: "Other management awards" },
          { id: 26, title: "Other Post Qualifying Social Work (PQSW) award" }
        ],
        'Certificate': [
          { id: 30, title: "Activity provision in social care" },
          { id: 31, title: "Adult care" },
          { id: 32, title: "Assisting and moving individuals in social care" },
          { id: 33, title: "Assisting and moving individuals for a social care setting" },
          { id: 34, title: "Autism support" },
          { id: 35, title: "Awareness of mental health problems" },
          { id: 36, title: "Clinical skills" },
          { id: 37, title: "Clinical skills" },
          { id: 38, title: "Fundamental knowledge in commissioning for wellbeing" },
          { id: 39, title: "Independent advocacy" },
          { id: 40, title: "Mental health awareness" },
          { id: 41, title: "Principles of leadership and management for adult care" },
          { id: 42, title: "Principles of safe handling of medication in health and social care" },
          { id: 43, title: "Principles of working with people with mental health needs" },
          { id: 44, title: "Social prescribing" },
          { id: 45, title: "Stroke care management" },
          { id: 47, title: "Supporting individuals with autism" },
          { id: 48, title: "Understanding mental health" },
          { id: 49, title: "Understanding autism" },
          { id: 50, title: "Understanding autism" },
          { id: 51, title: "Understanding care and management of diabetes" },
          { id: 52, title: "Understanding care and management of diabetes" },
          { id: 53, title: "Understanding diabetes" },
          { id: 54, title: "Understanding mental health care" },
          { id: 55, title: "Understanding the safe handling of medication" },
          { id: 56, title: "Understanding the safe handling of medication in health and social care" },
          { id: 57, title: "Understanding working in mental health" },
          { id: 58, title: "Understanding working with people with mental health needs" },
          { id: 59, title: "Delivering chair-based exercise with frailer older adults and adults with disabilities in care and community settings" },
          { id: 60, title: "Dementia care" },
          { id: 61, title: "Dementia care" },
          { id: 62, title: "Introduction to health, social care and children's and young people's settings" },
          { id: 63, title: "Leading and managing services to support end of life and significant life events" },
          { id: 64, title: "Preparing to work in adult social care" },
          { id: 65, title: "Preparing to work in adult social care" },
          { id: 66, title: "Supporting individuals with learning disabilities" },
          { id: 67, title: "Supporting individuals with learning disabilities" },
          { id: 68, title: "Working in end of life care" },
          { id: 69, title: "Working with individuals with diabetes" },
          { id: 134, title: "Other social care relevant certificate" },
          { id: 135, title: "Other non social care relevant certificate" }
        ],
        'Degree': [
          { id: 71, title: "Combined nursing and social work degree" },
          { id: 72, title: "Social work degree (UK)" },
          { id: 136, title: "Health and social care degree" }
        ],
        'Diploma': [
          { id: 74, title: "Adult care" },
          { id: 75, title: "Approved mental health practitioner" },
          { id: 76, title: "Approved social worker" },
          { id: 77, title: "Diploma in care" },
          { id: 78, title: "Diploma in care" },
          { id: 79, title: "Diploma in leadership and management for adult care" },
          { id: 80, title: "Health and social care: generic pathway" },
          { id: 81, title: "Health and social care: generic pathway" },
          { id: 82, title: "Health and social care: dementia" },
          { id: 83, title: "Health and social care: dementia" },
          { id: 84, title: "Health and social care: learning disabilities" },
          { id: 85, title: "Health and social care: learning disabilities" },
          { id: 86, title: "Leadership in health and social care, and children's and young people's services: adults' residential management" },
          { id: 87, title: "Leadership in health and social care, and children's and young people's services: adults' management" },
          { id: 88, title: "Leadership in health and social care, and children's and young people's services: adults' advanced practice" },
          { id: 90, title: "Other social care relevant diploma" },
          { id: 91, title: "Other non social care relevant diploma" },
          { id: 89, title: "Social work diploma or other approved (UK or non UK) social work qualification" }
        ],
        'NVQ': [
          { id: 96, title: "Health and social care NVQ" },
          { id: 97, title: "Health and social care NVQ" },
          { id: 98, title: "Health and social care NVQ" },
          { id: 99, title: "Other health and care-related NVQ" },
          { id: 100, title: "Registered manager's (adults) NVQ" },
          { id: 102, title: "A1, A2, or other assessor NVQ" },
          { id: 106, title: "L20 or other mentoring NVQ" },
          { id: 107, title: "V1 or other internal verifier NVQ" }
        ],
        'Other type of qualification': [
          { id: 103, title: "Any assessor qualification" },
          { id: 104, title: "Any internal verifier qualification" },
          { id: 105, title: "Any mentoring qualification" },
          { id: 109, title: "Basic skills qualification" },
          { id: 110, title: "Basic skills qualification" },
          { id: 111, title: "Basic skills qualification" },
          { id: 112, title: "Any childrens or young people's qualification" },
          { id: 117, title: "Other qualification relevant to social care" },
          { id: 118, title: "Other qualification relevant to the job role" },
          { id: 119, title: "Other qualification" },
          { id: 113, title: "Other relevant professional qualification" },
          { id: 114, title: "Any professional occupational therapy qualification" },
          { id: 116, title: "Any registered nursing qualification" },
          { id: 115, title: "Any qualification in assessment of work-based learning, other than social work" }
        ]
      };

      for (const key of Object.keys(qualGroups)) {
        for (const row of qualGroups[key]) {
          await models.workerAvailableQualifications.update(
            {
              title: row.title,
              group: key
            },
            {
              where: {
                id: row.id,
              },
            },
            { transaction },
          );
        }
      }
    });
    },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const qualGroups = {
        'Award': [
          { id: 1, title: 'Advanced Award in Social Work (AASW)' },
          { id: 2, title: 'Award in Stroke Awareness' },
          {
            id: 3,
            title: 'Award in Supporting Individuals on the Autistic Spectrum'
          },
          { id: 4, title: 'Awareness of Dementia' },
          { id: 5, title: 'Awareness of Dementia' },
          { id: 6, title: 'Awareness of End of Life Care' },
          { id: 7, title: 'Awareness of End of Life Care' },
          { id: 8, title: 'Awareness of the Mental Capacity Act 2005' },
          { id: 9, title: 'Basic awareness of Diabetes' },
          { id: 10, title: 'Emergency First Aid at Work' },
          {
            id: 11,
            title: "Employment Responsibilities and Rights in Health, Social Care, Children and Young People's Settings"
          },
          {
            id: 12,
            title: 'Food safety in health and social care and early years and childcare settings'
          },
          {
            id: 13,
            title: "Introduction to Health, Social Care and Children's and Young People's Settings"
          },
          { id: 14, title: 'Mental Health Social Work Award (MHSWA)' },
          { id: 15, title: 'Mentor Award' },
          {
            id: 16,
            title: 'Post-Qualifying Award in Social Work (PQSW) Part 1'
          },
          { id: 17, title: 'Preparing to Work in Adult Social Care' },
          {
            id: 18,
            title: 'Promoting food safety and nutrition in health and social care or early years and childcare settings'
          },
          {
            id: 19,
            title: 'Providing an Induction in to Assisting & Moving Individuals in Adult Social Care'
          },
          { id: 20, title: 'Supporting Activity Provision in Social Care' },
          {
            id: 21,
            title: 'Supporting Individuals with Learning Disabilities'
          },
          {
            id: 22,
            title: 'Supporting Individuals with Learning Disabilities'
          },
          {
            id: 23,
            title: 'Understanding Working with People with Mental Health Issues'
          },
          {
            id: 24,
            title: 'Any Learning Disabled Awards Framework (LDAF) award'
          },
          { id: 27, title: 'Any other social care relevant award' },
          { id: 28, title: 'Any other non-social care relevant award' },
          { id: 25, title: 'Other management awards' },
          { id: 26, title: 'Other Post-Qualifying Social Work Award' }
        ],
        'Certificate': [
          { id: 30, title: 'Activity Provision in Social Care' },
          { id: 31, title: 'Adult Care' },
          {
            id: 32,
            title: 'Assisting and Moving Individuals in Social Care'
          },
          {
            id: 33,
            title: 'Certificate in Assisting and Moving Individuals for a Social care Setting'
          },
          { id: 34, title: 'Certificate in Autism Support' },
          {
            id: 35,
            title: 'Certificate in Awareness of Mental Health Problems'
          },
          { id: 36, title: 'Certificate in Clinical Skills' },
          { id: 37, title: 'Certificate in Clinical Skills' },
          {
            id: 38,
            title: 'Certificate in Fundamental Knowledge in Commissioning for Wellbeing'
          },
          { id: 39, title: 'Certificate in Independent Advocacy' },
          { id: 40, title: 'Certificate in Mental Health Awareness' },
          {
            id: 41,
            title: 'Certificate in Principles of Leadership and Management in Adult Care'
          },
          {
            id: 42,
            title: 'Certificate in Principles of Safe Handling of Medication in Health and Social Care (RQF)'
          },
          {
            id: 43,
            title: 'Certificate in Principles of Working with People with Mental Health Needs'
          },
          { id: 44, title: 'Certificate in Social Prescribing' },
          { id: 45, title: 'Certificate in Stroke Care Management' },
          {
            id: 47,
            title: 'Certificate in Supporting Individuals on the Autistic Spectrum'
          },
          { id: 48, title: 'Certificate in Understand Mental Health' },
          { id: 49, title: 'Certificate in Understanding Autism' },
          { id: 50, title: 'Certificate in Understanding Autism' },
          {
            id: 51,
            title: 'Certificate in Understanding Care and Management of Diabetes'
          },
          {
            id: 52,
            title: 'Certificate in Understanding Care and Management of Diabetes'
          },
          { id: 53, title: 'Certificate in Understanding Diabetes' },
          {
            id: 54,
            title: 'Certificate in Understanding Mental Health Care'
          },
          {
            id: 55,
            title: 'Certificate in Understanding the Safe Handling of Medication'
          },
          {
            id: 56,
            title: 'Certificate in Understanding the Safe Handling of Medication in Health and Social Care'
          },
          {
            id: 57,
            title: 'Certificate in Understanding Working in Mental Health'
          },
          {
            id: 58,
            title: 'Certificate in Understanding Working with People with Mental Health Needs'
          },
          {
            id: 59,
            title: 'Delivering Chair-Based Exercise with Frailer Older Adults and Adults with Disabilities in Care and Community Settings'
          },
          { id: 60, title: 'Dementia Care' },
          { id: 61, title: 'Dementia Care' },
          {
            id: 62,
            title: "Introduction to Health, Social Care and Children's and Young People's Settings"
          },
          {
            id: 63,
            title: 'Leading and Managing Services to Support End of Life and Significant Life Events'
          },
          { id: 64, title: 'Preparing to work in Adult Social Care' },
          { id: 65, title: 'Preparing to work in Adult Social Care' },
          {
            id: 66,
            title: 'Supporting Individuals with Learning Disabilities'
          },
          {
            id: 67,
            title: 'Supporting Individuals with Learning Disabilities'
          },
          { id: 68, title: 'Working in End of Life care' },
          { id: 69, title: 'Working with individuals with Diabetes' },
          { id: 134, title: 'Any other social care relevant certificate' },
          {
            id: 135,
            title: 'Any other non-social care relevant certificate'
          }
        ],
        'Degree': [
          { id: 71, title: 'Combined Nursing & Social Work degree' },
          { id: 72, title: 'Social Work degree (UK)' },
          { id: 136, title: 'Health and Social Care degree' }
        ],
        'Diploma': [
          { id: 74, title: 'Adult Care' },
          { id: 75, title: 'Approved Mental Health Practitioner' },
          { id: 76, title: 'Approved Social Worker' },
          { id: 77, title: 'Diploma in Care (RQF)' },
          { id: 78, title: 'Diploma in Care (RQF)' },
          {
            id: 79,
            title: 'Diploma in Leadership and Management for Adult Care (RQF)'
          },
          { id: 80, title: 'Health and Social Care - Generic Pathway' },
          { id: 81, title: 'Health and Social Care - Generic Pathway' },
          { id: 82, title: 'Health and Social Care - Dementia' },
          { id: 83, title: 'Health and Social Care - Dementia' },
          { id: 84, title: 'Health and Social Care - Learning Disabilities' },
          { id: 85, title: 'Health and Social Care - Learning Disabilities' },
          {
            id: 86,
            title: "Leadership in Health and Social Care and Children and Young People's Services - Adults' Residential Management"
          },
          {
            id: 87,
            title: "Leadership in Health and Social Care and Children and Young People's Services - Adults' Management"
          },
          {
            id: 88,
            title: "Leadership in Health and Social Care and Children and Young People's Services - Adults' Advanced Practice"
          },
          { id: 90, title: 'Any other social care relevant diploma' },
          { id: 91, title: 'Any other non-social care relevant diploma' },
          {
            id: 89,
            title: 'Social Work diploma or other approved UK or non-UK social work qualification'
          }
        ],
        'NVQ': [
          { id: 93, title: 'Care NVQ' },
          { id: 94, title: 'Care NVQ' },
          { id: 95, title: 'Care NVQ' },
          { id: 96, title: 'Health and Social Care NVQ' },
          { id: 97, title: 'Health and Social Care NVQ' },
          { id: 98, title: 'Health and Social Care NVQ' },
          { id: 99, title: 'Other health and care-related NVQ(s)' },
          { id: 100, title: "Registered Manager's (Adults) NVQ" }
        ],
        'Assessor and mentoring': [
          { id: 102, title: 'A1, A2 or other Assessor NVQ' },
          { id: 103, title: 'Any Assessor qualification' },
          { id: 104, title: 'Any Internal Verifier qualification' },
          { id: 105, title: 'Any Mentoring qualification' },
          { id: 106, title: 'L20 or other Mentoring NVQ' },
          { id: 107, title: 'V1 or other Internal Verifier NVQ' }
        ],
        'Any other qualification': [
          { id: 109, title: 'A Basic Skills qualification' },
          { id: 110, title: 'A Basic Skills qualification' },
          { id: 111, title: 'A Basic Skills qualification' },
          { id: 112, title: "Any childrens/young people's qualification" },
          {
            id: 117,
            title: 'Any other qualification relevant to social care'
          },
          {
            id: 118,
            title: 'Any other qualification relevant to the job role'
          },
          { id: 119, title: 'Any other qualifications held' },
          { id: 113, title: 'Any other relevant professional qualification' },
          {
            id: 114,
            title: 'Any professional Occupational Therapy qualification'
          },
          { id: 116, title: 'Any Registered Nursing qualification' },
          {
            id: 115,
            title: 'Any qualification in assessment of work-based learning other than social work'
          }
        ],
        'Apprenticeship': [
          { id: 121, title: 'Adult Care Worker (standard)' },
          { id: 122, title: 'Adult Care Worker (standard)' },
          {
            id: 123,
            title: 'Advance Apprenticeships in Health and Social Care (framework)'
          },
          { id: 124, title: 'Degree Registered Nurse (standard)' },
          { id: 125, title: 'Degree Social Worker (standard)' },
          {
            id: 126,
            title: 'Higher Apprenticeship in Care Leadership and Management (framework)'
          },
          {
            id: 127,
            title: 'Intermediate Apprenticeship in Health and Social Care (framework)'
          },
          { id: 128, title: 'Lead Practitioner in Adult Care (standard)' },
          { id: 129, title: 'Leader in Adult Care (standard)' },
          { id: 130, title: 'Nursing Associate (standard)' },
          { id: 131, title: 'Occupational Therapist' },
          { id: 132, title: 'Physiotherapist' },
          {
            id: 133,
            title: 'Any other apprenticeship framework or standard'
          },
          { id: 137, title: 'Think ahead' },
          {
            id: 138,
            title: 'Social worker integrated Degree apprenticeship'
          }
        ]
      }

      for (const key of Object.keys(qualGroups)) {
        for (const row of qualGroups[key]) {
          await models.workerAvailableQualifications.update(
            {
              title: row.title,
              group: key
            },
            {
              where: {
                id: row.id,
              },
            },
            { transaction },
          );
        }
      }
    }
  )}
};
