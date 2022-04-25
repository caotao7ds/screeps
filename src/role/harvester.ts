import WorkAPIs from "../utils/WorkAPIs";

const RoleHarvester = {
  launch : function (creep: Creep): void {
    let working = false;
    if (creep.memory.working) {
      working = doWork(creep);
    } else {
      working = prepare(creep);
    }
    creep.memory.working = working;
  }
}

/**
 * RoleHarvester 采集角色
 * working==false 进入准备阶段: 转移身上的能量
 * working==true 进入工作阶段: 挖矿
 * 切换条件: 能量空了挖矿（工作），能量满了转运（准备）
 */
export default RoleHarvester;

function prepare(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0,5)+"-吃撑了");
  WorkAPIs.doTransfer(creep);
  // 能量不满？转working=true采集工作
  return creep.store.getFreeCapacity() > 0;
}

function doWork(creep: Creep): boolean {
  creep.say(creep.memory.role.substring(0,5)+"-工作中");
  WorkAPIs.doHarvest(creep);
  // 能量未满？转working=true采集工作
  return creep.store.getFreeCapacity() > 0;
}
