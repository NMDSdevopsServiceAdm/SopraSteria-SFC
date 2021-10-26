exports.sortQualificationsByGroup = (allQualificationRecords) => {
  return allQualificationRecords.qualifications.reduce(
    (sortedQualifications, record) => {
      const qualification = {
        title: record.qualification.title,
        year: record.year,
        notes: record.notes,
        uid: record.uid,
      };

      const existingGroup = sortedQualifications.groups.find((obj) => obj.group === record.qualification.group);

      if (existingGroup) {
        existingGroup.records.push(qualification);
      } else {
        sortedQualifications.groups.push({
          group: record.qualification.group,
          records: [qualification],
        });
      }
      return sortedQualifications;
    },
    { count: allQualificationRecords.count, lastUpdated: allQualificationRecords.lastUpdated, groups: [] },
  );
};
