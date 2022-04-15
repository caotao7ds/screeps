import workUtils from "../utils/WorkUtils";

const roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    // 不处于working且没有能量
    if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = true;
    }
    // 能量满了
    else if (creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
    }

    if (!creep.memory.working && creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
      workUtils.doBuild(creep);
    } else if (creep.memory.working) {
      workUtils.doHarvest(creep);
    } else if (creep.room.energyAvailable != creep.room.energyCapacityAvailable){
      workUtils.doTransfer(creep);
    }
  }
};

export default roleHarvester;
