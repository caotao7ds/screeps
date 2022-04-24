import { random } from "lodash";
import { ROLE_TRANSPORTER, ROLE_HARVESTER } from "role/Worker";

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
      let targets = new RoomPosition(store.x, store.y, store.roomName).lookFor(LOOK_STRUCTURES).filter(structure => {
        return (structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER);
      });
      if (targets.length) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
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
 * transporter 单位获取能量 container > link > storage >harvester
 * worker 单位获取能量 storage > link > container > harvester
 * 
 * @param creep
 */
function getEnergy(creep: Creep) {
  let drops = creep.room.find(FIND_DROPPED_RESOURCES).filter(r => { return r.resourceType == RESOURCE_ENERGY && r.amount > 200 });
  let tombstones = creep.room.find(FIND_TOMBSTONES).filter(t => { return t.store.getUsedCapacity() > 100 });
  let ruins = creep.room.find(FIND_RUINS).filter(r => { return r.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
  let sourceStructures = creep.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return (
        (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE ||
          structure.structureType == STRUCTURE_LINK)
      );
    }
  });
  const storage = sourceStructures.filter(structure => structure.structureType == STRUCTURE_STORAGE);
  const containers = sourceStructures.filter(structure => structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 0);
  const links = sourceStructures.filter(structure => structure.structureType == STRUCTURE_LINK);
  // transporter
  if (creep.memory.role == ROLE_TRANSPORTER) {
    // 地上有大量能量（>200）
    if (drops.length) {
      if (creep.pickup(drops[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(drops[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
    // 墓碑有大量能量（>100）
    else if (tombstones.length) {
      if (creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(tombstones[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else if (ruins.length) {
      if (creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(ruins[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
    else {
      let target;
      if (containers.length) {
        const i = containers.length == 1 ? 0 : Number.parseInt(creep.name.substring(creep.name.length - 1, creep.name.length)) % 2
        target = containers[i];
      }
      // 两个以上link，只去storage附近的link取
      else if (links.length >= 2) {
        const storageLink = storage[0].pos.findInRange(FIND_STRUCTURES, 5, {
          filter: (strusture => { return strusture.structureType == STRUCTURE_LINK; })
        });
        target = storageLink[0];
      }
      // 只有1个link，去link取
      else if (links.length == 1) {
        target = links[0];
      }
      // storage存在
      else {
        target = storage[0];
      }
      if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }
  // worker
  else if (sourceStructures.length && creep.memory.role != ROLE_TRANSPORTER) {
    let target;
    // storage存在
    if (storage.length &&
      creep.memory.role != ROLE_TRANSPORTER &&
      storage[0].structureType == STRUCTURE_STORAGE &&
      storage[0].store.getUsedCapacity(RESOURCE_ENERGY)) {
      target = storage[0];
    }
    // 两个以上link，只去storage附近的link取
    else if (links.length >= 2) {
      const storageLink = storage[0].pos.findInRange(FIND_STRUCTURES, 5, {
        filter: (strusture => { return strusture.structureType == STRUCTURE_LINK; })
      });
      target = storageLink[0];
      // console.log(target.pos)
    }
    //只有1个link，去link取
    else if (links.length == 1) {
      // console.log("只有1个link")
      target = links[0];
    }
    // 没有storage和link去container取
    else {
      // console.log("storage和link没能量")
      const i = containers.length == 1 ? 0 : Number.parseInt(creep.name.substring(creep.name.length - 1, creep.name.length)) % 2
      target = containers[i];
    }
    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
  // 没有容器的话找 harvester 取（低等级时）
  else if (!sourceStructures.length) {
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
      // console.log("找harvester拿")
      let target = Game.creeps[harvesterName];
      creep.moveTo(target);
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
