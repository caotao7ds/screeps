interface Worker {
  getEnergy: (target: RoomPosition) => void;
  doWork: (target: RoomPosition) => void;
};

export default Worker;
