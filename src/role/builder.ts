import workUtils from "../utils/WorkUtils";

const roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false;
    } else if(creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true;
    }
    if (creep.memory.working) {
      workUtils.doBuild(creep);
    }
    else {
      workUtils.getEnergy(creep);
    }
  }
};

export default roleBuilder;