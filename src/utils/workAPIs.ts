import { ROLE_HARVESTER } from "role/Role";

const workAPIs = {
  doHarvest: doHarvest,
  doBuild: doBuild,
  doTransfer: doTransfer,
  getEnergy: getEnergy,
  doRepair: doRepair
};

/**
 * worker单位获取能量
 *
 * @param creep
 */
function getEnergy(creep: Creep) {
  let drops = creep.room.find(FIND_DROPPED_RESOURCES);
  if (drops.length) {
    if (creep.pickup(drops[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(drops[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  } else {
    let structures = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 300
        );
      }
    });
    if (creep.withdraw(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

function doHarvest(creep: Creep) {
  if (creep.memory.orgin) {
    const o = creep.memory.orgin;
    const target = new RoomPosition(o.x, o.y, o.roomName).lookFor(LOOK_SOURCES)[0];
    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
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
  const targets = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.hits / structure.hitsMax < 0.3 && structure.structureType != STRUCTURE_WALL;
    }
  });
  const target = _.sortBy(targets, structure => {
    return structure.hits / structure.hitsMax;
  })[0];
  if (targets.length) {
    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

/**
 * harvester/carrier转移能量到存储容器
 * harvester转移到 link > container > extension > spawn
 * carrier转移到 extension > spawn > tower > store
 * @param creep
 */
function doTransfer1(creep: Creep) {
  if (creep.memory.role == ROLE_HARVESTER) {
  } else {
  }
}

function doTransfer(creep: Creep) {
  if (creep.memory.role == ROLE_HARVESTER && creep.memory.destination) {
    const d = creep.memory.destination;
    const target = new RoomPosition(d.x, d.y, d.roomName).lookFor(LOOK_STRUCTURES)[0];
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  } else {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType == STRUCTURE_STORAGE ||
            structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_TOWER ||
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    let target;
    for (let i = 0; i < targets.length; i++) {
      const element = targets[i];
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
  }
  // if (targets.length > 0) {
  //   if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  //     creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
  //   }
  // }
}

export default workAPIs;
