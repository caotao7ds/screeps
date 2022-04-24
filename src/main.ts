import { ErrorMapper } from "utils/ErrorMapper";

import RoleHarvester from "role/harvester";
import RoleUpgrader from "role/upgrader";
import RoleBuilder from "role/builder";
import RoleCarrier from "role/transporter";
import RoleRepairer from "role/repairer";
import structureTower from "role/tower";
import structureLink from "role/linker";

import memoryUtils from "utils/MemorySetter";

import ExtensionsMount from "utils/Extensions";
import { ROLE_BUILDERS, ROLE_TRANSPORTER, ROLE_HARVESTER, ROLE_REPAIRERS, ROLE_UPGRADER, CreepAction } from "role/Worker";
import CreepGenerator from "utils/CreepGenerator";

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
    blueprintString: string;
  }

  interface Room {}

  interface Creep {
    launch: Function;
  }
  interface Creep extends CreepAction{}

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
  const room: Room = Game.spawns["Spawn1"].room;

  const towers = room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.structureType == STRUCTURE_TOWER;
    }
  });
  const links = room.find(FIND_STRUCTURES, {
    filter: structure => {
      return structure.structureType == STRUCTURE_LINK;
    }
  });

  memoryUtils.setter(room);

  ExtensionsMount();
  // 从内存中清理死亡的creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      console.log(name + "已死亡,从Memory中移除 ");
      delete Memory.creeps[name];
      for (const source in Memory.sources) {
        const i = Memory.sources[source].worker.indexOf(name);
        if (i >= 0) {
          console.log(name + "已死亡,从Memory.sources[].worker中移除 ");
          Memory.sources[source].worker.splice(i, 1);
        }
      }
    }
  }

  CreepGenerator.generateCreeps(room);

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role == ROLE_HARVESTER) {
      creep.launch = new RoleHarvester(creep.id).launch;
      creep.launch();
    }
    if (creep.memory.role == ROLE_UPGRADER) {
      creep.launch = new RoleUpgrader(creep.id).launch;
      creep.launch();
    }
    if (creep.memory.role == ROLE_BUILDERS) {
      creep.launch = new RoleBuilder(creep.id).launch;
      creep.launch();
    }
    if (creep.memory.role == ROLE_TRANSPORTER) {
      creep.launch = new RoleCarrier(creep.id).launch;
      creep.launch();
    }
    if (creep.memory.role == ROLE_REPAIRERS) {
      creep.launch = new RoleRepairer(creep.id).launch;
      creep.launch();
    }
  }

  
  towers.forEach(tower => {
    if (tower.structureType == STRUCTURE_TOWER) {
      structureTower.run(tower);
    }
  });

  links.forEach(link => {
    if (link.structureType == STRUCTURE_LINK) {
      structureLink.run(link);
    }
  });
});
