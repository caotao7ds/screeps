const memoryUtils = {
  /** 各个source和最近的container */
  linkContainerAndSource: function (room: Room) {
    const sources = room.find(FIND_SOURCES);
    room.sources = sources;
    sources.forEach(source => {
      const container = source.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType == STRUCTURE_CONTAINER;
        }
      });
      if (container) {
        if (source.worker == undefined) {
          source.worker = [];
        }
        source.store = container;
      }
    });
  },
  generateHarvesterOrgin: function (sources: Source[]) {
    return _.sortBy(sources, source => {
      return source.worker.length;
    })[0];
  },
  generateHarvesterDestination: function (source: Source) {
    return source.store;
  }
};

export default memoryUtils;
