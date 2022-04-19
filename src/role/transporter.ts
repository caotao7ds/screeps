import workAPIs from "../utils/workAPIs";

const roleTransfer = {
    /**
     * 从某处转移到某处 
     * @param {Creep} creep **/
    run: function (creep: Creep) {
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            workAPIs.doTransfer(creep);
        } else {
            workAPIs.getEnergy(creep);
        }

    }
};

export default roleTransfer;