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
        if (!source.worker) {
          source.worker = [];
        }
        source.store = container;
      }
    });
  },
  generateHarvesterOrgin: function (sources: Source[]) {
    return sources.sort((a, b) => {
      return a.worker.length - b.worker.length;
    })[0];
  },
  generateHarvesterDestination: function (source: Source) {
    return source.store;
  }
};

export default memoryUtils;
