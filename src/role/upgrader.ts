import WorkAPIs from "../utils/WorkAPIs";

/**
 * RoleUpgrader 转运角色
 * 准备阶段: 获取能量
 * 工作阶段: 升级
 * 切换条件: 能量空了获取能量（准备），能量满了升级（工作）
 */
export default class RoleUpgrader extends Creep {
  launch = function (this: RoleUpgrader): void {
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
  creep.say(creep.memory.role.substring(0,5)+"-prepare");
  WorkAPIs.getEnergy(creep);
  // 能量满了？转working=true 做升级工作
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0,5)+"-doWork");
  WorkAPIs.doUpgrader(creep);
  // 能量未空？转working=true 做升级工作
  return creep.store[RESOURCE_ENERGY] != 0;
}
