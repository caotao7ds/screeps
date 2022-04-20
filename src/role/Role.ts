const ROLE_HARVESTER = "harvester";
const ROLE_UPGRADER = "upgrader";
const ROLE_BUILDERS = "builder";
const ROLE_CARRIER = "carrier";
const ROLE_REPAIRERS = "repairer";

export { ROLE_HARVESTER, ROLE_UPGRADER, ROLE_BUILDERS, ROLE_CARRIER, ROLE_REPAIRERS };

export interface CreepAction {
  lanuch:Function;
}