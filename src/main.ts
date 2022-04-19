import { ErrorMapper } from "utils/ErrorMapper";
import RoleHarvester from "role/harvester";
import RoleUpgrader from "role/upgrader";
import RoleBuilder from "role/builder";
import Roletransporter from "role/transporter";
import RoleRepairer from "role/repairer";
import BodyAutoConfig from "utils/BodyAutoConfig";
import memoryUtils from "utils/MemorySetter";

import Extensions from "utils/Extensions";

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
  }

  interface Room {
    sources: Source[];
  }

  interface Creep {
    launch:Function
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    orgin: RoomPosition | undefined;
    destination: RoomPosition | undefined;
  }

  interface Source {
    worker: string[];
    store: AnyStructure;
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
  const transporter = _.filter(Game.creeps, creep => creep.memory.role == "transporter");
  const repairers = _.filter(Game.creeps, creep => creep.memory.role == ROLE_REPAIRERS);

  const room: Room = Game.spawns["Spawn1"].room;
  const spawn: StructureSpawn = Game.spawns["Spawn1"];

  const harvesterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.harvester);
  const transporterBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.transporter);
  const repairerBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
  const upgraderBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);
  const buildersBodyGetter = BodyAutoConfig.createBodyGetter(BodyAutoConfig.bodyConfigs.worker);

  memoryUtils.linkContainerAndSource(room);

  Extensions();
  // 从内存中清理死亡的creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
      room.sources?.forEach(source => {
        const i = source.worker.indexOf(name);
        if (i) {
          source.worker.splice(i, 1);
        }
      });
    }
  }

  if (harvesters.length < 1) {
    const newName = "Harvester" + Game.time;
    const source = memoryUtils.generateHarvesterOrgin(room.sources);
    const orgin = source.pos;
    const destination = memoryUtils.generateHarvesterDestination(orgin.lookFor(LOOK_SOURCES)[0]).pos;
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
      const s = Game.getObjectById(source.id);
      if (s) {
        s.worker.push(newName);
      }
    }
    console.log("spawn harvester result: " + result);
  }

  if (transporter.length < 1) {
    const newName = "transporter" + Game.time;
    const result = Game.spawns["Spawn1"].spawnCreep(transporterBodyGetter(room, spawn), newName, {
      memory: {
        role: "transporter",
        room: Game.spawns["Spawn1"].room.name,
        working: false,
        orgin: undefined,
        destination: undefined
      }
    });
    console.log("spawn transporter result: " + result);
  }

  // 先造1个harvester和1个transporter再造第2个harvester
  if (harvesters.length < 2) {
    const newName = "Harvester" + Game.time;
    const source = memoryUtils.generateHarvesterOrgin(room.sources);
    const orgin = source.pos;
    const destination = memoryUtils.generateHarvesterDestination(orgin.lookFor(LOOK_SOURCES)[0]).pos;
    const result = Game.spawns["Spawn1"].spawnCreep(harvesterBodyGetter(room, spawn), newName, {
      memory: {
        role: "harvester",
        room: Game.spawns["Spawn1"].room.name,
        working: false,
        orgin: orgin,
        destination: destination
      }
    });
    if (result == 0) {
      const s = Game.getObjectById(source.id);
      if (s) {
        s.worker.push(newName);
      }
    }
    console.log("spawn harvester result: " + result);
  }

  if (builders.length < 2) {
    // 存在待建才生成builder
    const targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      const newName = "builder" + Game.time;
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

  if (upgrader.length < 3) {
    const newName = "upgrader" + Game.time;
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

  if (repairers.length < 1) {
    const targets = room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.hits / structure.hitsMax < 0.2 && structure.structureType != STRUCTURE_WALL;
      }
    });
    if (targets.length) {
      // 存在需要修复的对象才生成repairer
      const newName = "repairer" + Game.time;
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
    if (creep.memory.role == "harvester") {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == "upgrader") {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == "builder") {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == "transporter") {
      roletransporter.run(creep);
    }
    if (creep.memory.role == "repairer") {
      roleRepairer.run(creep);
    }
  }
});
