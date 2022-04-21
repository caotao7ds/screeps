import { ROLE_TRANSPORTER, ROLE_HARVESTER } from "role/Role";

const WorkAPIs = {
  doHarvest: doHarvest,
  doBuild: doBuild,
  doTransfer: doTransfer,
  getEnergy: getEnergy,
  doRepair: doRepair,
  doUpgrader: doUpgrader
};

/**
 * harvester/carrier转移能量到存储容器
 * harvester 转移到 link > container > creep > extension > spawn
 * carrier 转移到 extension > spawn > tower > store
 * @param creep
 */
function doTransfer(creep: Creep) {
  // role == ROLE_HARVESTER
  if (creep.memory.role == ROLE_HARVESTER) {
    const store = creep.memory.destination;
    // 如果store存在（非undefined），转移到 link > container
    if (store) {
      let target = new RoomPosition(store.x, store.y, store.roomName).lookFor(LOOK_STRUCTURES)[0];
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    }
    // 如果store不存在（对于harvester来说，不是矿点附近的store等于不存在）
    else {
      // 周围一格是否有其它worker，有则转移给worker
      const creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
        filter: otherCreep => {
          return otherCreep.name != creep.name && otherCreep.store.getFreeCapacity() > 0; // 返回自身外的creep
        }
      });
      if (creeps.length > 0) {
        let target = creeps[0];
        creep.transfer(target, RESOURCE_ENERGY);
      }
      // 没有worker则自己送去10格范围内的 extension > spawn
      else {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: structure => {
            return (
              (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
          }
        });
        const extensions = targets.filter(
          structure => structure.structureType == STRUCTURE_EXTENSION && creep.pos.inRangeTo(structure, 10)
        );
        const spawns = targets.filter(structure => structure.structureType == STRUCTURE_SPAWN);
        let target;
        if (extensions.length) {
          target = extensions[0];
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
          }
        } else if (spawns.length) {
          let target = spawns[0];
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
          }
        }
      }
    }
  }
  // role != ROLE_HARVESTER
  else {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType == STRUCTURE_STORAGE ||
            structure.structureType == STRUCTURE_TOWER ||
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    let target;
    const storage = targets.filter(structure => structure.structureType == STRUCTURE_STORAGE);
    const extensions = targets.filter(structure => structure.structureType == STRUCTURE_EXTENSION);
    const spawns = targets.filter(structure => structure.structureType == STRUCTURE_SPAWN);
    const towers = targets.filter(structure => structure.structureType == STRUCTURE_TOWER);
    if (extensions.length) {
      target = extensions[0];
    } else if (spawns.length) {
      target = spawns[0];
    } else if (towers.length) {
      target = towers[0];
    } else if (storage.length) {
      target = storage[0];
    }
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }
}

/**
 * carrier单位获取能量
 * container > harvester
 * worker单位获取能量
 * link > store > container > harvester
 * @param creep
 */
function getEnergy(creep: Creep) {
  let drops = creep.room.find(FIND_DROPPED_RESOURCES);
  let sources = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return (
        (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE ||
          structure.structureType == STRUCTURE_LINK) &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 200
      );
    }
  });
  // 容器能量满足条件则从容器取
  if (sources.length) {
    let target;
    const storage = sources.filter(structure => structure.structureType == STRUCTURE_STORAGE);
    const containers = sources.filter(structure => structure.structureType == STRUCTURE_CONTAINER);
    const links = sources.filter(structure => structure.structureType == STRUCTURE_LINK);
    if (storage.length) {
      target = storage[0];
    } else if (links.length) {
      target = links[0];
    } else {
      target = containers[0];
    }
    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
  // 没有容器或容器能量不满足条件的话判断是否有掉落能量以及 harvester
  else {
    // 地上是否有能量
    if (drops.length && creep.memory.role == ROLE_TRANSPORTER) {
      if (creep.pickup(drops[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(drops[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else {
      let existHarvesters: boolean = false;
      let harvesterName: string = "";
      for (const key in Game.creeps) {
        if (Game.creeps[key].memory.role == ROLE_HARVESTER) {
          existHarvesters = true;
          harvesterName = key;
          break;
        }
      }
      if (existHarvesters) {
        let target = Game.creeps[harvesterName];
        creep.moveTo(target);
      }
    }
  }
}

/**
 * 采集能量
 * @param creep
 */
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

function doUpgrader(creep: Creep) {
  if (creep.room.controller) {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

export default WorkAPIs;
