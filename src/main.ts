import { ErrorMapper } from "utils/ErrorMapper";

import RoleHarvester from "role/harvester";
import RoleUpgrader from "role/upgrader";
import RoleBuilder from "role/builder";
import Roletransporter from "role/transporter";
import RoleRepairer from "role/repairer";
import BodyAutoConfig from "utils/BodyAutoConfig";
import roleTower from "role/tower";

import memoryUtils from "utils/MemorySetter";

import ExtensionsMount from "utils/Extensions";
import { ROLE_BUILDERS, ROLE_CARRIER, ROLE_HARVESTER, ROLE_REPAIRERS, ROLE_UPGRADER } from "role/Role";
import { filter } from "lodash";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    sources: { [name: string]: SourceMemory };
  }

  interface Room {}

  interface Creep {
    launch: Function;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    orgin: RoomPosition | undefined;
    destination: RoomPosition | undefined;
  }

  interface SourceMemory {
    id: string;
    roomName: string;
    pos: RoomPosition;
    worker: string[];
    store: RoomPosition | undefined;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  const harvesters = _.filter(Game.creeps, creep => creep.memory.role == ROLE_HARVESTER);
  const upgrader = _.filter(Game.creeps, creep => creep.memory.role == ROLE_UPGRADER);
  const builders = _.filter(Game.creeps, creep => creep.memory.role == ROLE_BUILDERS);
  const carriers = _.filter(Game.creeps, creep => creep.memory.role == ROLE_CARRIER);
  const repairers = _.filter(Game.creeps, creep => creep.memory.role == ROLE_REPAIRERS);

  const room: Room = Game.spawns["Spawn1"].room;
  const spawn: StructureSpawn = Game.spawns["Spawn1"];

  const towers = room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.structureType == STRUCTURE_TOWER;
    }
  });

  const harvesterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.harvester);
  const transporterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.transporter);
  const repairerBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
  const upgraderBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
  const buildersBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);

  memoryUtils.setter(room);

  ExtensionsMount();
  // 从内存中清理死亡的creeps

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      console.log("creep-%s 已死亡,从Memory中移除", name);
      delete Memory.creeps[name];
      for (const source in Memory.sources) {
        const i = Memory.sources[source].worker.indexOf(name);
        if (i >= 0) {
          console.log("creep-%s 已死亡,从Memory.sources[].worker中移除", name);
          Memory.sources[source].worker.splice(i, 1);
        }
      }
    }
  }

  if (harvesters.length < 1) {
    const newName = "Harvester" + Game.time;
    // 返回的是拷贝
    const source = memoryUtils.generateHarvesterOrgin();
    const orgin = source.pos;
    const destination = source.store;
    const result = Game.spawns["Spawn1"].spawnCreep(harvesterBodyGetter(room, spawn), newName, {
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

  // 存在1个以上harvester才生成carrier
  if (carriers.length < 1 && harvesters.length >= 1) {
    const newName = "Carrier" + Game.time;
    const result = Game.spawns["Spawn1"].spawnCreep(transporterBodyGetter(room, spawn), newName, {
      memory: {
        role: ROLE_CARRIER,
        room: Game.spawns["Spawn1"].room.name,
        working: false,
        orgin: undefined,
        destination: undefined
      }
    });
    console.log("spawn carrier result: " + result);
  }

  // 先造1个harvester和1个transporter再造第2个harvester
  if (harvesters.length < 2 && carriers.length >= 1) {
    const newName = "Harvester" + Game.time;
    // 返回的是拷贝
    const source = memoryUtils.generateHarvesterOrgin();
    const orgin = source.pos;
    const destination = source.store;
    const result = Game.spawns["Spawn1"].spawnCreep(harvesterBodyGetter(room, spawn), newName, {
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

  if (builders.length < 2 && harvesters.length >= 2 && carriers.length >= 1) {
    // 存在待建才生成builder
    const targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      const newName = "Builder" + Game.time;
      const result = Game.spawns["Spawn1"].spawnCreep(buildersBodyGetter(room, spawn), newName, {
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
  }

  if (upgrader.length < 3 && harvesters.length >= 2 && carriers.length >= 1) {
    const newName = "Upgrader" + Game.time;
    const result = Game.spawns["Spawn1"].spawnCreep(upgraderBodyGetter(room, spawn), newName, {
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

  if (towers.length == 0 && repairers.length < 1 && harvesters.length >= 2 && carriers.length >= 1) {
    const targets = room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.hits / structure.hitsMax < 0.2 && structure.structureType != STRUCTURE_WALL;
      }
    });
    if (targets.length) {
      // 存在需要修复的对象才生成repairer
      const newName = "Repairer" + Game.time;
      const result = Game.spawns["Spawn1"].spawnCreep(repairerBodyGetter(room, spawn), newName, {
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

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role == ROLE_HARVESTER) {
      creep.launch = new RoleHarvester(creep.id).launch;
      creep.launch();
    }
    if (creep.memory.role == ROLE_UPGRADER) {
      RoleUpgrader.run(creep);
    }
    if (creep.memory.role == ROLE_BUILDERS) {
      RoleBuilder.run(creep);
    }
    if (creep.memory.role == ROLE_CARRIER) {
      Roletransporter.run(creep);
    }
    if (creep.memory.role == ROLE_REPAIRERS) {
      RoleRepairer.run(creep);
    }
  }

  towers.forEach(tower => {
    if (tower.structureType == STRUCTURE_TOWER) {
      roleTower.run(tower);
    }
  });
});
