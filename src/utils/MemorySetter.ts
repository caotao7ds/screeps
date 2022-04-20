const memoryUtils = {
  setter: function (room: Room) {
    this.setSourceMemory(room);
  },
  /** 各个source和最近的container */
  setSourceMemory: function (room: Room) {
    if (!Memory.sources) {
      console.log("Memory.sources undefined, init Memory.sources");
      Memory.sources = {};
    }
    const sources = room.find(FIND_SOURCES);
    sources.forEach(source => {
      if (!Memory.sources[source.id]) {
        Memory.sources[source.id] = {
          roomName: source.room.name,
          pos: source.pos,
          id: source.id,
          worker: [],
          store: undefined
        };
      }
      const sourceRange5 = source.pos.findInRange(FIND_STRUCTURES, 5);
      const containers = sourceRange5.filter(structure => {
        return structure.structureType == STRUCTURE_CONTAINER;
      });
      const links = sourceRange5.filter(structure => {
        return structure.structureType == STRUCTURE_LINK;
      });
      if (links.length) {
        Memory.sources[source.id].store = links[0].pos;
      } else if (containers.length) {
        Memory.sources[source.id].store = containers[0].pos;
      }
    });
  },
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

export default memoryUtils;
