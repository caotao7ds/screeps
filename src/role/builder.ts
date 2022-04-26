import WorkAPIs from "../utils/WorkAPIs";

const RoleBuilder = {
  launch: function (creep: Creep): void {
    let working = false;
    if (creep.memory.working) {
      working = doWork(creep);
    } else {
      working = prepare(creep);
    }
    creep.memory.working = working;
  }
};

/**
 * RoleBuilder 转运角色
 * 准备阶段: 获取能量
 * 工作阶段: 建筑
 * 切换条件: 能量空了获取能量（准备），能量满了建筑（工作）
 */
export default RoleBuilder;

function prepare(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0, 5) + "-没有抛瓦");
  WorkAPIs.getEnergy(creep);
  // 能量满了？转working=true 做建筑工作
  return creep.store.getFreeCapacity() == 0;
}
function doWork(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0, 5) + "-工作中");
  WorkAPIs.doBuild(creep);
  // 能量未空？转working=true 做建筑工作
  return creep.store[RESOURCE_ENERGY] != 0;
}
