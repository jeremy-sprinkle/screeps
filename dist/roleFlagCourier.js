var path = require('funcMoveCreep');
var log = require('funcLogging')

var flagHarvester = {
    run: function (creep) {
        var c = global.logging.roles

        //RESET TO HARVESTING MODE AFTER DELIVERY
        if (!creep.memory.fetching && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            log(c, creep.name + " resetting to fetch mode.")
            creep.memory.fetching = true;
        }
        if (creep.memory.fetching && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            log(c, "delivering")
            creep.memory.fetching = false;

        }
        var spawn1 = Game.spawns['Spawn1']
        var cpuStart = Game.cpu.getUsed()

        var nearbyEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 15)
        if (nearbyEnemies.length > 0) {
            if (_.filter(global.alerts, (alert) => alert.room == creep.room.name).length == 0) {
                global.alerts.push({"room": creep.room.name, "timer": nearbyEnemies[0].ticksToLive, "time":Game.time})
            }
            log(c, creep.moveTo(Game.spawns['Spawn1']))
            return;
        }


        var flagPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom)

        if (creep.room.name == creep.memory.targetRoom && creep.memory.fetching == true) {
            var container = flagPos.findInRange(FIND_STRUCTURES, 1,
                {filter: (structure) => structure.structureType == 'container'});
            //log(c, creep.name + " in target room.")
            if (container) {
                log(c, "creep found container: " + container)
                //console.log(creep.name+ " has space to harvest.")
                var dropped = creep.room.find(FIND_DROPPED_RESOURCES)[0]
                if (dropped) {
                    if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                        path(creep, dropped)

                        log(c, creep.name + " moving to fetch dropped stuff.")
                    }
                } else if (creep.withdraw(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, container[0])
                    log(c, creep.name + " moving to fetch.")
                }
            }
        } else {

            if (creep.memory.fetching == true) {
                var roomAlerts = _.filter(global.alerts, (alert) => alert.room == flagPos.roomName)
                    log(c, creep.name + " room alerts:" +roomAlerts)
                if (roomAlerts.length == 0) {
                    creep.moveTo(flagPos, {visualizePathStyle: {stroke: "#ffffff", opacity: 1, lineStyle: "dotted"}})
                    log(c, creep.name + " supposed to move to flagPos.")
                } else {
                    log(c, creep.moveTo(Game.spawns['Spawn1']))
                    /*creep.memory.idle += 1
                    log(c, creep.name + " is bored and wants to die.")
                    if (creep.memory.idle >= 30 && Game.spawns['Spawn1'].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                        path(creep, spawn1)
                    }*/
                }
            }

            if (creep.memory.fetching == false) {
                //log(c, creep.name + " not fetching - looking to work or deliver.")
                var underMe = creep.pos.findInRange(FIND_STRUCTURES, 3)
                var underMe2 = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)
                var underMe3 = creep.pos.lookFor(LOOK_STRUCTURES)
                var targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                log(c, creep.name + " found target: "+ targets)
                if (underMe.length && (underMe[0].structureType == "container" || underMe[0].structureType == "road") && underMe[0].hits < underMe[0].hitsMax) {
                    creep.repair(underMe[0])
                    log(c, creep.name + " repairing.")
                } else if (underMe2.length && underMe2[0].structureType == "road") {
                    log(c, creep.name + " building highway.")
                    creep.build(underMe2[0])
                } else if (!underMe3.length && creep.room.createConstructionSite(creep.pos, "road") == OK) {
                    log(c, creep.name + " placing highway.")

                } else if (targets && creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, targets)
                    log(c, creep.name + " moving to transfer to: " + targets)
                } else if (creep.transfer(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, spawn1)
                    log(c, creep.name + " moving to spawn.")
                } else {
                    log(c, creep.name + " doing nothing.")
                }


            }
        }


        var cpuEnd = Game.cpu.getUsed()
        //console.log("CPU used by roleFlagHarvester - Reset: "+Math.floor(cpuEnd-cpu4))
    }
}

module.exports = flagHarvester;