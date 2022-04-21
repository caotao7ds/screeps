import workAPIs from "../utils/workAPIs";
/**
 * RoleHarvester 采集角色
 * working==false 进入准备阶段: 转运
 * working==true 进入工作阶段: 挖矿
 * 切换条件: 能量空了挖矿（工作），能量满了转运（准备）
 */
export default class RoleHarvester extends Creep {
  launch = function (this: RoleHarvester): void {
    let working = false;
    if (this.memory.working) {
      working = doWork(this);
    } else {
      working = prepare(this);
    }
    this.memory.working = working;
  };
}

/**
 * 
 * @param creep 
 * @returns 
 */
function prepare(creep: Creep): boolean {
  workAPIs.doTransfer(creep);
  // 能量不满？转working=true采集工作
  return creep.store.getFreeCapacity() > 0;
}


function doWork(creep: Creep): boolean {
  workAPIs.doHarvest(creep);
  // 能量未满？转working=true采集工作
  return creep.store.getFreeCapacity() > 0;
}
