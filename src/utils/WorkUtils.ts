import { any, sortBy, transform } from "lodash";

const workUtils = {
  doHarvest: doHarvest,
  doBuild: doBuild,
  doTransfer: doTransfer,
  getEnergy: getEnergy
};

function getEnergy(creep: Creep) {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  creep.moveTo(targets[0]);
  creep.withdraw(targets[0], RESOURCE_ENERGY);
}

function doHarvest(creep: Creep) {
  var sources = creep.room.find(FIND_SOURCES);
  if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

function doBuild(creep: Creep) {
  var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
  if (targets.length) {
    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

function doTransfer(creep: Creep) {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return (
        (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    }
  });
  let target;
  for (let index = 0; index < targets.length; index++) {
    const element = targets[index];
    if (element.structureType == STRUCTURE_SPAWN || element.structureType == STRUCTURE_EXTENSION) {
      target = element;
      break;
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
