import { ROLE_BUILDERS, ROLE_HARVESTER, ROLE_REPAIRERS, ROLE_TRANSPORTER, ROLE_UPGRADER } from "role/Role";
import BodyAutoConfig from "utils/BodyAutoConfig";
import Creep2StructureLinker from "./Creep2StructureLinker";

export default {
  generateCreeps: function (room: Room) {
    const harvesters = _.filter(Game.creeps, creep => creep.memory.role == ROLE_HARVESTER);
    const upgraders = _.filter(Game.creeps, creep => creep.memory.role == ROLE_UPGRADER);
    const builders = _.filter(Game.creeps, creep => creep.memory.role == ROLE_BUILDERS);
    const transporters = _.filter(Game.creeps, creep => creep.memory.role == ROLE_TRANSPORTER);
    const repairers = _.filter(Game.creeps, creep => creep.memory.role == ROLE_REPAIRERS);
    const towers = room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType == STRUCTURE_TOWER;
      }
    });

    const spawns = room.find(FIND_MY_SPAWNS);
    let spawn;
    if (spawns.length) {
      spawn = spawns[0];
    }
    if (spawn && (Game.time % 201 === 0 || spawn.room.energyAvailable == spawn.room.energyCapacityAvailable)) {
      const construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
      let construction_sites_need = 0;
      construction_sites.forEach((cur) => { construction_sites_need = construction_sites_need + cur.progressTotal - cur.progress; })
      /**
       * 生成 harvester
       * 第1个：不存在 harvester
       * 第2个：存在 transporter + harvester
       */
      if (harvesters.length == 0 || (harvesters.length < 2 && transporters.length >= 1)) {
        generateHarvester(spawn);
        return;
      }
      /**
       * 生成 transporter
       * 第1个：不存在 transporter 并且存在1个以上 harvester
       * 第2个：存在2个以上 harvester 和1个transporter 并且不存在待建
       */
      if (
        transporters.length == 0 ||
        (transporters.length < 2 && harvesters.length >= 2)
      ) {
        generateTransporter(spawn);
        return;
      }
      /**
       * 生成 builder
       * 第1个：存在1个以上 harvester 和 transporter 并且存在待建
       */
      if (builders.length == 0 && construction_sites.length) {
        generateBuilder(spawn);
        return;
      }
      /**
       * 生成 upgrader
       * 第1个：存在1个以上 harvester 和 transporter 和builder
       */
      if (upgraders.length == 0) {
        generateUpgrader(spawn);
        return;
      }
      /**
       * 生成额外的worker
       * 存在2个以上 harvester 、1个以上 transporter 、1个以上 upgrader 才额外造 worker
       */
      if (harvesters.length >= 2 && transporters.length >= 1) {
        // 存在待建才生成builder
        if (transporters.length < 3) {
          generateTransporter(spawn);
          return;
        } 
        else 
        if (
          (builders.length < 2 && construction_sites_need > 3000) ||
          (builders.length < 4 && construction_sites_need > 9000)
        ) {
          generateBuilder(spawn);
          return;
        } else if (upgraders.length < 4 && construction_sites_need < 500) {
          generateUpgrader(spawn);
          return;
        }
      }
      if (towers.length < 1 && repairers.length < 1 && harvesters.length >= 2 && transporters.length >= 1) {
        // 存在需要修复的对象才生成repairer
        const targets = spawn.room.find(FIND_STRUCTURES, {
          filter: structure => {
            return structure.hits / structure.hitsMax < 0.4 && structure.structureType != STRUCTURE_WALL;
          }
        });
        if (targets.length) {
          generateRepairer(spawn);
        }
      }
    }
  }
};

const harvesterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.harvester);
const transporterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.transporter);
const repairerBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
const upgraderBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
const buildersBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);

function generateHarvester(spawn: StructureSpawn) {
  const newName = generateCreepName(ROLE_HARVESTER);
  // 返回的是拷贝
  const source = Creep2StructureLinker.generateHarvesterOrgin();
  const orgin = source.pos;
  const destination = source.store;
  const result = Game.spawns["Spawn1"].spawnCreep(harvesterBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: ROLE_HARVESTER,
      room: Game.spawns["Spawn1"].room.name,
      working: false,
      orgin: orgin,
      destination: destination
    }
  });
  if (result == 0) {
    Memory.sources[source.id].worker.push(newName);
  }
  console.log("spawn harvester result: " + result);
}
function generateTransporter(spawn: StructureSpawn) {
  const newName = generateCreepName(ROLE_TRANSPORTER);
  const result = Game.spawns["Spawn1"].spawnCreep(transporterBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: ROLE_TRANSPORTER,
      room: Game.spawns["Spawn1"].room.name,
      working: false,
      orgin: undefined,
      destination: undefined
    }
  });
  console.log("spawn carrier result: " + result);
}
function generateBuilder(spawn: StructureSpawn) {
  const newName = generateCreepName(ROLE_BUILDERS);
  const result = Game.spawns["Spawn1"].spawnCreep(buildersBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: ROLE_BUILDERS,
      room: Game.spawns["Spawn1"].room.name,
      working: false,
      orgin: undefined,
      destination: undefined
    }
  });
  console.log("spawn builder result: " + result);
}
function generateUpgrader(spawn: StructureSpawn) {
  const newName = generateCreepName(ROLE_UPGRADER);
  const result = Game.spawns["Spawn1"].spawnCreep(upgraderBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: ROLE_UPGRADER,
      room: Game.spawns["Spawn1"].room.name,
      working: false,
      orgin: undefined,
      destination: undefined
    }
  });
  console.log("spawn upgrader result: " + result);
}
function generateRepairer(spawn: StructureSpawn) {
  const targets = spawn.room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.hits / structure.hitsMax < 0.2 && structure.structureType != STRUCTURE_WALL;
    }
  });
  if (targets.length) {
    // 存在需要修复的对象才生成repairer
    const newName = generateCreepName(ROLE_REPAIRERS);
    const result = Game.spawns["Spawn1"].spawnCreep(repairerBodyGetter(spawn.room, spawn), newName, {
      memory: {
        role: ROLE_REPAIRERS,
        room: Game.spawns["Spawn1"].room.name,
        working: false,
        orgin: undefined,
        destination: undefined
      }
    });
    console.log("spawn repairer result: " + result);
  }
}

/**
 * 生成Creep名字
 * @param roleName 
 * @returns creepName
 */
function generateCreepName(roleName: string): string {
  let singularCount = 0;
  let dualCount = 0;
  if (roleName != ROLE_HARVESTER) {
    for (const key in Game.creeps) {
      const num = Number(key.substring(key.length - 1, key.length));
      if (num % 2 == 0) {
        dualCount++;
      } else {
        singularCount++;
      }
    }
  }
  let lastNum = 1;
  if (singularCount > dualCount) {
    lastNum = 2;
  }
  const tickStr = String(Game.time);
  return roleName.substring(0, 5) + tickStr.substring(tickStr.length - 4, tickStr.length) + String(lastNum);
}
