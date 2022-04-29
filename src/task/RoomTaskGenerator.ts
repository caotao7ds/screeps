/**
 * 获取房间内未储满的存储建筑
 * @param
 * @returns 返回未储满的存储建筑
 */
function getLessStores(room: Room): AnyStoreStructure[] {
  return room.find(FIND_STRUCTURES, {
    filter: s => {
      return (
        (s.structureType == STRUCTURE_SPAWN && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_STORAGE && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      );
    }
  });
}

/**
 * 获取房间内能取出能量的存储建筑
 * @param
 * @returns 返回房间内能取出能量的存储建筑
 */
function getUsedStores(room: Room): AnyStoreStructure[] {
  return room.find(FIND_STRUCTURES, {
    filter: s => {
      return (
        (s.structureType == STRUCTURE_STORAGE && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType == STRUCTURE_LINK && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
      );
    }
  });
}

/**
 * 获取房间中掉落的资源
 * @param room
 * @returns 房间中掉落的资源的RoomPosition[]
 */
function getDropedResource(room: Room): RoomPosition[] {
  let result: RoomPosition[] = [];
  let drops = room.find(FIND_DROPPED_RESOURCES).filter(r => {
    return r.resourceType == RESOURCE_ENERGY && r.amount >= 200;
  });
  let tombstones = room.find(FIND_TOMBSTONES).filter(t => {
    return t.store.getUsedCapacity() >= 100;
  });
  let ruins = room.find(FIND_RUINS).filter(r => {
    return r.store.getUsedCapacity(RESOURCE_ENERGY) >= 100;
  });
  drops.forEach(d => result.push(d.pos));
  tombstones.forEach(t => result.push(t.pos));
  ruins.forEach(r => result.push(r.pos));
  return result;
}

/**
 * 获取建筑工地
 * @param room
 * @returns
 */
function getConstructionSite(room: Room): ConstructionSite<BuildableStructureConstant>[] {
  return room.find(FIND_CONSTRUCTION_SITES);
}

/**
 * 获取资源点
 * @param room
 * @returns
 */
function getSources(room: Room) {
  return room.find(FIND_SOURCES);
}

/**
 * 获取矿藏点
 * @param room
 * @returns
 */
function getMineral(room: Room) {
  return room.find(FIND_MINERALS
  //   , {
  //   filter: m => {
  //     return m.mineralAmount > 0;
  //   }
  // }
  )[0];
}

/**
 * 返回背包满了的creep
 * @param creeps
 * @returns
 */
function getFullCreeps(creeps: _.Dictionary<Creep>) {
  return _.filter(creeps, c => {
    return c.store.getFreeCapacity() == 0;
  });
}

/**
 * 返回背包未满的creep
 * @param creeps
 * @returns
 */
function getNoFullCreeps(creeps: _.Dictionary<Creep>) {
  return _.filter(creeps, c => {
    return c.store.getFreeCapacity() > 0;
  });
}

export default {
  getLessStores: getLessStores,
  getDropedResource: getDropedResource,
  getUsedStores: getUsedStores,
  getSources: getSources,
  getConstructionSite: getConstructionSite,
  getFullCreeps: getFullCreeps,
  getNoFullCreeps: getNoFullCreeps,
  getMineral: getMineral
};
