import memoryUtils from "./MemorySetter";

const extensions = {
}
export default function(){
  _.assign(global, extensions);
}