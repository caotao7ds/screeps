import memoryUtils from "./MemorySetter";

const extensions = {
  generateHarvesterOrgin: memoryUtils.generateHarvesterOrgin,
  generateHarvesterDestination: memoryUtils.generateHarvesterDestination
}
export default function(){
  _.assign(global, extensions);
}