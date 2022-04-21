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

/**
 * RoleCarrier 转运角色
 * 准备阶段: 获取能量
 * 工作阶段: 转运
 * 切换条件: 能量空了获取能量（准备），能量满了转运（工作）
 */
export default class RoleCarrier extends Creep {
  launch = function (this: RoleCarrier): void {
    let working = false;
    if (this.memory.working) {
      working = doWork(this);
    } else {
      working = prepare(this);
    }
    this.memory.working = working;
  };
}

function prepare(creep: Creep): boolean {
  workAPIs.getEnergy(creep);
  // 能量满了？转working=true 转运能量
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  workAPIs.doTransfer(creep);
  // 能量未空？转working=true 转运能量
  return creep.store[RESOURCE_ENERGY] != 0;
}
