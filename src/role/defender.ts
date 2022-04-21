import WorkAPIs from "../utils/WorkAPIs";

/**
 * RoleBuilder 转运角色
 * 准备阶段: 待机
 * 工作阶段: 攻击
 * 切换条件: 没有敌方单位切（准备），发现敌方单位切（工作）
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
  creep.say(creep.memory.role.substring(0,5)+"-prepare");
  WorkAPIs.getEnergy(creep);
  // 能量满了？转working=true 做建筑工作
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0,5)+"-doWork");
  WorkAPIs.doBuild(creep);
  // 能量未空？转working=true 做建筑工作
  return creep.store[RESOURCE_ENERGY] != 0;
}
