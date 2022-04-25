type Worker = {
  getEnergy: (target: RoomPosition) => boolean;
  doWork: (target: RoomPosition) => void;
};

export default Worker;
