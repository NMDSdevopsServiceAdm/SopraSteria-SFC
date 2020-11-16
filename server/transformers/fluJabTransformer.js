const FluJabTransformer = async (workers) => {
  return workers.map(worker => {
    return {
      id: worker.id,
      uid: worker.uid,
      name: worker.NameOrIdValue,
      fluJab: worker.FluJabValue
    };
  });
}

module.exports.FluJabTransformer = FluJabTransformer;
