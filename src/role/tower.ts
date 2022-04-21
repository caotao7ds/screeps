const roleTower = {

  run: function (tower: StructureTower) {
    if (tower) {
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        tower.attack(closestHostile);
      }
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits / structure.hitsMax < 0.3
          && structure.structureType != STRUCTURE_RAMPART
          && structure.structureType != STRUCTURE_WALL
      });
      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
    }
  }
}

export default roleTower;