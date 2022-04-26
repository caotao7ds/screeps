const structureLink = {
  run: function (link: StructureLink) {
    // 传到storage附近的link
    const storage = link.room.find(FIND_STRUCTURES, {
      filter: strusture => {
        return strusture.structureType == STRUCTURE_STORAGE;
      }
    });
    if (storage.length) {
      const storageLink = storage[0].pos.findInRange(FIND_STRUCTURES, 5, {
        filter: strusture => {
          return strusture.structureType == STRUCTURE_LINK;
        }
      });
      if (storageLink.length) {
        if (link && storageLink[0].structureType == STRUCTURE_LINK) {
          link.transferEnergy(storageLink[0]);
        }
      }
    }
  }
};
export default structureLink;
