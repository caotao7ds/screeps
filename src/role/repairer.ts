import workAPIs from "../utils/workAPIs";

/**
 * RoleRepairer 修复角色
 * 准备阶段: 获取能量
 * 工作阶段: 修复
 * 切换条件: 能量空了获取能量（准备），能量满了转运（工作）
 */
export default class RoleRepairer extends Creep {
  launch = function (this: RoleRepairer): void {
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
  // 能量满了？转working=true 做修复工作
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  workAPIs.doRepair(creep);
  // 能量未空？转working=true 做修复工作
  return creep.store[RESOURCE_ENERGY] != 0;
}
