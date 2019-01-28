module.exports = function(sequelize, DataTypes) {
  const Worker = sequelize.define('worker', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: '"WorkerUID"'
    },
    establishmentFk : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentFK"'
    },
    NameOrIdValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      len: [0,50],
      field: '"NameOrIdValue"'
    },
    NameOrIdSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameOrIdSavedAt"'
    },
    NameOrIdChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NameOrIdChangedAt"'
    },
    NameOrIdSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameOrIdSavedBy"'
    },
    NameOrIdChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NameOrIdChangedBy"'
    },
    ContractValue: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'],
      field: '"ContractValue"'
    },
    ContractSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ContractSavedAt"'
    },
    ContractChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ContractChangedAt"'
    },
    ContractSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ContractSavedBy"'
    },
    ContractChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ContractChangedBy"'
    },
    MainJobFkValue : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"MainJobFKValue"'
    },
    MainJobFkSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobFKSavedAt"'
    },
    MainJobFkChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobFKChangedAt"'
    },
    MainJobFkSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainJobFKSavedBy"'
    },
    MainJobFkChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainJobFKChangedBy"'
    },
    ApprovedMentalHealthWorkerValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', 'Don\'t know'],
      field: '"ApprovedMentalHealthWorkerValue"'
    },
    ApprovedMentalHealthWorkerSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ApprovedMentalHealthWorkerSavedAt"'
    },
    ApprovedMentalHealthWorkerChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"ApprovedMentalHealthWorkerChangedAt"'
    },
    ApprovedMentalHealthWorkerSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ApprovedMentalHealthWorkerSavedBy"'
    },
    ApprovedMentalHealthWorkerChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ApprovedMentalHealthWorkerChangedBy"'
    },
    MainJobStartDateValue: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobStartDateValue"'
    },
    MainJobStartDateSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobStartDateSavedAt"'
    },
    MainJobStartDateChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"MainJobStartDateChangedAt"'
    },
    MainJobStartDateSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainJobStartDateSavedBy"'
    },
    MainJobStartDateChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"MainJobStartDateChangedBy"'
    },
    NationalInsuranceNumberValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalInsuranceNumberValue"'
    },
    NationalInsuranceNumberSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NationalInsuranceNumberSavedAt"'
    },
    NationalInsuranceNumberChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NationalInsuranceNumberChangedAt"'
    },
    NationalInsuranceNumberSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalInsuranceNumberSavedBy"'
    },
    NationalInsuranceNumberChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalInsuranceNumberChangedBy"'
    },
    DateOfBirthValue: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DateOfBirthValue"'
    },
    DateOfBirthSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DateOfBirthSavedAt"'
    },
    DateOfBirthChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DateOfBirthChangedAt"'
    },
    DateOfBirthSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"DateOfBirthSavedBy"'
    },
    DateOfBirthChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"DateOfBirthChangedBy"'
    },
    PostcodeValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PostcodeValue"'
    },
    PostcodeSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PostcodeSavedAt"'
    },
    PostcodeChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PostcodeChangedAt"'
    },
    PostcodeSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PostcodeSavedBy"'
    },
    PostcodeChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PostcodeChangedBy"'
    },
    GenderValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Female', 'Male', 'Other', 'Don\'t know'],
      field: '"GenderValue"'
    },
    GenderSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"GenderSavedAt"'
    },
    GenderChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"GenderChangedAt"'
    },
    GenderSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"GenderSavedBy"'
    },
    GenderChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"GenderChangedBy"'
    },
    DisabilityValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', 'Undisclosed', 'Don\'t know'],
      field: '"DisabilityValue"'
    },
    DisabilitySavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DisabilitySavedAt"'
    },
    DisabilityChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"DisabilityChangedAt"'
    },
    DisabilitySavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"DisabilitySavedBy"'
    },
    DisabilityChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"DisabilityChangedBy"'
    },
    EthnicityFkValue : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"EthnicityFKValue"'
    },
    EthnicityFkSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EthnicityFKSavedAt"'
    },
    EthnicityFkChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EthnicityFKChangedAt"'
    },
    EthnicityFkSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EthnicityFKSavedBy"'
    },
    EthnicityFkChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EthnicityFKChangedBy"'
    },
    QualificationFkValue : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"QualificationFKValue"'
    },
    QualificationFkSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"QualificationFKSavedAt"'
    },
    QualificationFkChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"QualificationFKChangedAt"'
    },
    QualificationFkSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"QualificationFKSavedBy"'
    },
    QualificationFkChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"QualificationFKChangedBy"'
    },
    NationalityValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['British', 'Other', 'Don\'t know'],
      field: '"NationalityValue"'
    },
    NationalityOtherFK : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"NationalityOtherFK"'
    },
    NationalitySavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NationalitySavedAt"'
    },
    NationalityChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"NationalityChangedAt"'
    },
    NationalitySavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalitySavedBy"'
    },
    NationalityChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"NationalityChangedBy"'
    },
    CountryOfBirthValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['United Kingdom', 'Other', 'Don\'t know'],
      field: '"CountryOfBirthValue"'
    },
    CountryOfBirthOtherFK : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"CountryOfBirthOtherFK"'
    },
    CountryOfBirthSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CountryOfBirthSavedAt"'
    },
    CountryOfBirthChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"CountryOfBirthChangedAt"'
    },
    CountryOfBirthSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CountryOfBirthSavedBy"'
    },
    CountryOfBirthChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"CountryOfBirthChangedBy"'
    },
    RecruitedFromValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No'],
      field: '"RecruitedFromValue"'
    },
    RecruitedFromOtherFK : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"RecruitedFromOtherFK"'
    },
    RecruitedFromSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"RecruitedFromSavedAt"'
    },
    RecruitedFromChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"RecruitedFromChangedAt"'
    },
    RecruitedFromSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"RecruitedFromSavedBy"'
    },
    RecruitedFromChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"RecruitedFromChangedBy"'
    },
    BritishCitizenshipValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
      field: '"BritishCitizenshipValue"'
    },
    BritishCitizenshipSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"BritishCitizenshipSavedAt"'
    },
    BritishCitizenshipChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"BritishCitizenshipChangedAt"'
    },
    BritishCitizenshipSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"BritishCitizenshipSavedBy"'
    },
    BritishCitizenshipChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"BritishCitizenshipChangedBy"'
    },
    YearArrivedValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No'],
      field: '"YearArrivedValue"'
    },
    YearArrivedYear : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"YearArrivedYear"'
    },
    YearArrivedSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"YearArrivedSavedAt"'
    },
    YearArrivedChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"YearArrivedChangedAt"'
    },
    YearArrivedSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"YearArrivedSavedBy"'
    },
    YearArrivedChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"YearArrivedChangedBy"'
    },
    SocialCareStartDateValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No'],
      field: '"SocialCareStartDateValue"'
    },
    SocialCareStartDateYear : {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"SocialCareStartDateYear"'
    },
    SocialCareStartDateSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SocialCareStartDateSavedAt"'
    },
    SocialCareStartDateChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SocialCareStartDateChangedAt"'
    },
    SocialCareStartDateSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SocialCareStartDateSavedBy"'
    },
    SocialCareStartDateChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SocialCareStartDateChangedBy"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created'
    },
    OtherJobsValue : {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Yes', 'No', "Don't know"],
      field: '"OtherJobsValue"'
    },
    OtherJobsSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OtherJobsSavedAt"'
    },
    OtherJobsChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"OtherJobsChangedAt"'
    },
    OtherJobsSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"OtherJobsSavedBy"'
    },
    OtherJobsChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"OtherJobsChangedBy"'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated'
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'updatedby'
    }
  }, {
    tableName: '"Worker"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false,    // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
  });

  Worker.associate = (models) => {
    Worker.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment'
    });
    Worker.belongsTo(models.job, {
      foreignKey: 'MainJobFkValue',
      targetKey: 'id',
      as: 'mainJob'
    });
    Worker.hasMany(models.workerAudit, {
      foreignKey: 'workerFk',
      sourceKey: 'id',
      as: 'auditEvents'
    });
    Worker.belongsTo(models.ethnicity, {
      foreignKey: 'EthnicityFkValue',
      targetKey: 'id',
      as: 'ethnicity'
    });
    Worker.belongsTo(models.nationality, {
      foreignKey: 'NationalityOtherFK',
      targetKey: 'id',
      as: 'nationality'
    });
    Worker.belongsTo(models.qualification, {
      foreignKey: 'QualificationFkValue',
      targetKey: 'id',
      as: 'qualification'
    });
    Worker.belongsTo(models.country, {
      foreignKey: 'CountryOfBirthOtherFK',
      targetKey: 'id',
      as: 'countryOfBirth'
    });
    Worker.belongsTo(models.recruitedFrom, {
      foreignKey: 'RecruitedFromOtherFK',
      targetKey: 'id',
      as: 'recruitedFrom'
    });
    Worker.belongsToMany(models.job, {
      through: 'workerJobs',
      foreignKey: 'jobFk',
      otherKey: 'id',
      as: 'otherJobs'
    });
  };

  return Worker;
};
