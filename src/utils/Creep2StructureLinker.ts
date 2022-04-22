/**
 * creep和建筑一对一绑定
 */
const Creep2StructureLinker = {
  generateHarvesterOrgin: function () {
    const sortResult = _.sortBy(Memory.sources, source => {
      return source.worker.length;
    });
    return sortResult[0];
  },
  generateHarvesterDestination: function (source: SourceMemory) {
    return source.store;
  }
};

export default Creep2StructureLinker;
