import { ROLE_BUILDERS, ROLE_HARVESTER, ROLE_REPAIRERS, ROLE_TRANSPORTER, ROLE_UPGRADER } from "role/Role";
import BodyAutoConfig from "utils/BodyAutoConfig";
import Creep2StructureLinker from "./Creep2StructureLinker";

export default {
  generateCreeps: function (room: Room) {
    const harvesters = _.filter(Game.creeps, creep => creep.memory.role == ROLE_HARVESTER);
    const upgrader = _.filter(Game.creeps, creep => creep.memory.role == ROLE_UPGRADER);
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
    if (spawn) {
      if (harvesters.length < 1) {
        generateHarvester(spawn);
      }
      const construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
      // 存在1个以上harvester才生成transporter
      if (transporters.length < 1 && harvesters.length >= 1) {
        generateTransporter(spawn);
      }
      // 存在1个以上 harvester 和 transporter 才生成 builder
      // 存在待建才生成builder
      if (builders.length < 1 && harvesters.length >= 1 && transporters.length >= 1 && construction_sites.length) {
        generateBuilder(spawn);
      }
      // 先造1个 harvester 和1个 transporter 再造第2个 harvester
      if (harvesters.length < 2 && transporters.length >= 1 && builders.length >= 1) {
        generateHarvester(spawn);
      }
      if (harvesters.length >= 2 && transporters.length >= 1) {
        // 存在待建才生成builder
        if (builders.length < 1 && construction_sites.length) {
          generateBuilder(spawn);
        }
        else if (upgrader.length < 1) {
          generateUpgrader(spawn);
        }
        else if (builders.length < 2 && construction_sites.length > 5) {
          generateBuilder(spawn);
        }
        else if (builders.length < 4 && construction_sites.length > 10) {
          generateBuilder(spawn);
        }
        else if (upgrader.length < 3 && construction_sites.length == 0) {
          generateUpgrader(spawn);
        }
        else if (transporters.length < 2 && harvesters.length >= 2 && construction_sites.length == 0 && builders.length == 0) {
          generateTransporter(spawn);
        }
        else if (upgrader.length < 5 && construction_sites.length == 0 && builders.length == 0) {
          generateUpgrader(spawn);
        }
      }

      if (towers.length < 2 && repairers.length < 1 && harvesters.length >= 2 && transporters.length >= 1) {
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
  const newName = ROLE_HARVESTER + Game.time;
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
  const newName = ROLE_TRANSPORTER + Game.time;
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
  const newName = ROLE_BUILDERS + Game.time;
  const result = Game.spawns["Spawn1"].spawnCreep(buildersBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: "builder",
      room: Game.spawns["Spawn1"].room.name,
      working: false,
      orgin: undefined,
      destination: undefined
    }
  });
  console.log("spawn builder result: " + result);
}
function generateUpgrader(spawn: StructureSpawn) {
  const newName = ROLE_UPGRADER + Game.time;
  const result = Game.spawns["Spawn1"].spawnCreep(upgraderBodyGetter(spawn.room, spawn), newName, {
    memory: {
      role: "upgrader",
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
    const newName = ROLE_REPAIRERS + Game.time;
    const result = Game.spawns["Spawn1"].spawnCreep(repairerBodyGetter(spawn.room, spawn), newName, {
      memory: {
        role: "repairer",
        room: Game.spawns["Spawn1"].room.name,
        working: false,
        orgin: undefined,
        destination: undefined
      }
    });
    console.log("spawn repairer result: " + result);
  }
}
