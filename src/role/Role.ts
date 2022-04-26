const ROLE_HARVESTER = "harvester";
const ROLE_UPGRADER = "upgrader";
const ROLE_BUILDERS = "builder";
const ROLE_TRANSPORTER = "transporter";
const ROLE_REPAIRERS = "repairer";

export { ROLE_HARVESTER, ROLE_UPGRADER, ROLE_BUILDERS, ROLE_TRANSPORTER, ROLE_REPAIRERS };

export interface CreepAction {
  lanuch(Creep: Creep): void;
  // destroy(Creep:Creep) :void;
}
