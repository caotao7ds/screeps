import { ErrorMapper } from "utils/ErrorMapper";
import roleHarvester from "role/harvester";
import roleUpgrader from "role/upgrader";
import roleBuilder from "role/builder";

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

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
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
  const harvesters = _.filter(Game.creeps, creep => creep.memory.role == "harvester");
  const upgrader = _.filter(Game.creeps, creep => creep.memory.role == "upgrader");
  const builders = _.filter(Game.creeps, creep => creep.memory.role == "builder");

  if (harvesters.length < 2) {
    console.log("Harvesters: " + harvesters.length);
    var newName = "Harvester" + Game.time;
    console.log("Spawning new harvester: " + newName);
    Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE], newName, {
      memory: {
        role: "harvester",
        room: Game.spawns["Spawn1"].room.name,
        working: false
      }
    });
  }

  if (upgrader.length < 1) {
    console.log("Upgrader: " + harvesters.length);
    var newName = "Upgrader" + Game.time;
    console.log("Spawning new upgrader: " + newName);
    Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE], newName, {
      memory: {
        role: "upgrader",
        room: Game.spawns["Spawn1"].room.name,
        working: false
      }
    });
  }

  if (builders.length < 2) {
    console.log("Builder: " + builders.length);
    var newName = "Builder" + Game.time;
    console.log("Spawning new builder: " + newName);
    Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE], newName, {
      memory: {
        role: "builder",
        room: Game.spawns["Spawn1"].room.name,
        working: false
      }
    });
  }

  // Automatically delete memory of missing creeps
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
  }
});
