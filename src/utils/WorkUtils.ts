import { any, drop, sortBy, transform } from "lodash";

const workUtils = {
  doHarvest: doHarvest,
  doBuild: doBuild,
  doTransfer: doTransfer,
  getEnergy: getEnergy,
  doRepair: doRepair
};

function getEnergy(creep: Creep) {
  let drops = creep.room.find(FIND_DROPPED_RESOURCES);
  if (drops.length) {
    if (creep.pickup(drops[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(drops[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
  
  let structures = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if (creep.withdraw(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

function doHarvest(creep: Creep) {
  let sources = creep.room.find(FIND_SOURCES);
  if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

function doBuild(creep: Creep) {
  let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
  if (targets.length) {
    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

function doRepair(creep: Creep) {
  let targets = creep.room.find(FIND_STRUCTURES
    , {
    filter: structure => {
      return (
        structure.hits / structure.hitsMax < 0.3
      && structure.structureType != STRUCTURE_WALL
      )
    }
  }
  );
  if (targets.length) {
    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

function doTransfer(creep: Creep) {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return (
        (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_TOWER ||
          structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    }
  });
  let target;
  for (let index = 0; index < targets.length; index++) {
    const element = targets[index];
    // SPAWN 和 EXTENSION优先
    if (element.structureType == STRUCTURE_SPAWN || element.structureType == STRUCTURE_EXTENSION) {
      if (element.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        target = element;
        break;
      }
    }
    target = element;
  }
  if (target) {
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  // if (targets.length > 0) {
  //   if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  //     creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
  //   }
  // }
}

export default workUtils;
