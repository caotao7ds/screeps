const extensions = {
  generateHarvesterOrgin: function (sources: Source[]) {
    return sources.sort((a, b) => {
      return a.worker.length - b.worker.length;
    })[0];
  },
  generateHarvesterDestination: function (source: Source) {
    return source.store;
  }
}

export default function(){
  _.assign(global, extensions);
}