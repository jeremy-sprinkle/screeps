var roleRampartRepair = {

    /** @param {Creep} creep **/
    run: function (creep, ramparts, rv) {
        var spawn1 = Game.spawns['Spawn1']

        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.repairing = true;
        }
        var damagedRamparts = _.filter(ramparts, (rampart) => rampart.hits < rampart.hitsMax)
        if (creep.memory.repairing) {
            if (creep.repair(damagedRamparts[0]) == ERR_NOT_IN_RANGE) {
                path(creep, damagedRamparts)
            }
        } else {
            var t = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var targets = t.sort(function (a, b) {
                return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
            })
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            var energyDif = creep.room.energyCapacityAvailable - creep.room.energyAvailable

            if (dropped.length > 0) {
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    path(creep, dropped)
                }
            } else if (targets.length > 0) {
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, targets)
                }
            } else {
                creep.say('IDLE')
            }
        }
    }
};

module.exports = roleRampartRepair;