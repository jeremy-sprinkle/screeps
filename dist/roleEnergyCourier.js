var path = require('funcMoveCreep');
var findEnergy = require('funcGetCourierWithdraw');
var putEnergy = require('funcGetCourierDeposit');
var roleCourier = {

    run: function (creep, rv, sv) {
        var cpuStart = Game.cpu.getUsed()

        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10)
        var nearbyTowers = creep.room.find(FIND_STRUCTURES, (structures) => structures.structureType == 'tower')
        if (nearbyEnemies.length > 0) {
            if (nearbyTowers.length) {
                //console.log(creep.name + " fleeing to " + nearbyTowers[0].id)
                path(creep, nearbyTowers)
            } else {
                //console.log(creep.name + " fleeing to Spawn1")
                path(creep, Game.spawns['Spawn1'])
            }
        }

        if (creep.memory.delivering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.delivering = false;
        }
        if (!creep.memory.delivering && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.delivering = true;
        }

        //DROPPING OFF
        if (creep.memory.delivering) {
            var target = putEnergy(creep, sv)
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name+" pathing to target: "+target+", stalled for "+creep.memory.stallCount+" ticks.")
                path(creep, target)
            } else if (creep.transfer(target, RESOURCE_ENERGY) == OK) {
                //console.log(creep.name+" has delivered energy.")
                creep.memory.movingTo = null
            } else {
                //console.log(creep.name+" idle in deliver mode.")
            }

            //PICKING UP
        } else {

            var nearby = creep.room.lookAtArea(creep.pos.y + 1, creep.pos.x - 1, creep.pos.y - 1, creep.pos.x + 1)
            console.log(nearby)

            var target = findEnergy(creep, sv)
            //console.log(creep.name+" found pickup target: "+target)
            if (target && creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name+" pathing to target: "+target+", stalled for "+creep.memory.stallCount+" ticks.")
                path(creep, target);
            } else if (target && creep.pickup(target) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name+" pathing to target: "+target)
                path(creep, target);
                //console.log(creep.name+" pathing to dropped energy: "+target+", stalled for "+creep.memory.stallCount+" ticks.")
                path(creep, target);
            } else if (creep.pickup(target) == OK) {
                //console.log(creep.name+" has picked up dropped energy.")
            } else {
                //console.log(creep.name+" idle in pick up mode.")
            }
        }
        var cpuEnd = Game.cpu.getUsed()
        //console.log("roleEnergyCourier used : "+Math.floor(cpuEnd-cpuStart)+" CPU")
    }

};

module.exports = roleCourier;