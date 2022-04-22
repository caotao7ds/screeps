const memoryUtils = {
  setter: function (room: Room) {
    this.setSourceMemory(room);
    this.initStructureBlueprint(room);
    if (Game.time % 1000 == 0) {
      this.compareAndUpdateStructureBlueprint(room);
    }
  },
  initStructureBlueprint(room: Room) {
    if (!Memory.blueprintString) {
      let currentStructures = room.find(FIND_MY_STRUCTURES);
      let blueprintString = "";
      currentStructures.forEach(s => {
        blueprintString =
          blueprintString + s.pos.roomName + "," + s.pos.x + "," + s.pos.y + "," + s.structureType + ";";
      });
      Memory.blueprintString = blueprintString;
    }
  },
  compareAndUpdateStructureBlueprint(room: Room) {
    let currentStructures = room.find(FIND_MY_STRUCTURES);
    let blueprintString = Memory.blueprintString;
    currentStructures.forEach(s => {
      let structureString = s.pos.roomName + "," + s.pos.x + "," + s.pos.y + "," + s.structureType + ";";
      // 新建筑
      if (blueprintString.indexOf(structureString) == -1) {
        blueprintString = blueprintString + structureString;
      }
    });
    Memory.blueprintString = blueprintString;
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
      } else {
        Memory.sources[source.id].store = undefined;
      }
    });
  }
};

export default memoryUtils;
