import workAPIs from "../utils/workAPIs";

const roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    // 不处于working且没有能量
    if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = true;
    }
    // 能量满了
    else if (creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
    }

    if (creep.memory.working) {
      workAPIs.doHarvest(creep);
    } else {
      if (creep.memory.destination) {
        const o = creep.memory.destination;
        const target = new RoomPosition(o.x, o.y, o.roomName).lookFor(LOOK_STRUCTURES)[0];
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    }
    // else {
    //   let targets = creep.room.find(FIND_STRUCTURES, {
    //     filter: structure => {
    //       return (
    //         structure.structureType == STRUCTURE_CONTAINER &&
    //         structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    //       );
    //     }
    //   });
    //   const target = creep.pos.findClosestByRange(FIND_STRUCTURES,
    //     {
    //       filter: structure => {
    //         return (
    //           structure.structureType == STRUCTURE_CONTAINER
    //         );
    //       }

    //     })
    //   if (target) {
    //     if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    //       creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    //     }
    //   }
    // }
  }
};

export default class RoleHarvester implements Role, CreepAction {
  roleName = ROLE_HARVESTER;
  static launch(creep: Creep): void {
    let working = false;
    if (creep.memory.working) {
      working = this.prepare(creep);
    } else {
      working = this.working(creep);
    }
    creep.memory.working = working;
  }
  static prepare(creep: Creep): boolean {
    workAPIs.doTransfer(creep);
    // 能量空了？
    return creep.store[RESOURCE_ENERGY] == 0;
  }
  static working(creep: Creep): boolean {
    workAPIs.doHarvest(creep);
    // 能量满了？
    return creep.store.getFreeCapacity() <= 0;
  }
}
