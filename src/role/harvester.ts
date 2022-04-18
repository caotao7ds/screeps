import workUtils from "../utils/WorkUtils";

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
      workUtils.doHarvest(creep);
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

export default roleHarvester;
