import workAPIs from "../utils/workAPIs";

/**
 * RoleBuilder 转运角色
 * 准备阶段: 获取能量
 * 工作阶段: 建筑
 * 切换条件: 能量空了获取能量（准备），能量满了建筑（工作）
 */
export default class RoleBuilder extends Creep {
  launch = function (this: RoleBuilder): void {
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
  // 能量满了？转working=true 做建筑工作
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  workAPIs.doBuild(creep);
  // 能量未空？转working=true 做建筑工作
  return creep.store[RESOURCE_ENERGY] != 0;
}
