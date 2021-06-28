var path = require('funcMoveCreep');
var log = require('funcLogging')
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep, sv, cv, rv) {
        var c = global.logging.roles

        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            log(c, creep.name + " out of energy, leaving build mode.")
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            log(c, creep.name + " has full energy, entering build mode.")
            creep.memory.takingFromSpawn = false;
            creep.memory.building = true;
        }

        if (creep.memory.building) {
            log(c, creep.name + " in build mode.")
            var targets = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            var repairs = _.filter(creep.room.find(FIND_STRUCTURES), (struct) => struct.hits < (struct.hitsMax - 100)
                && struct.structureType != "constructedWall" && struct.structureType != "controller")
            if (targets) {
                log(c, creep.name + " going to build: " + targets)
                if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                    path(creep, targets);
                }
            } else if (repairs.length > 0) {
                var bestRepair = repairs.sort(function (a, b) {
                    return a.hits - b.hits
                })
                var totalDamage = 0
                for (var r in bestRepair) {
                    totalDamage += (bestRepair[r].hitsMax - bestRepair[r].hits)
                }
                log(c, creep.name + " going to repair: " + bestRepair[0] + " with " + totalDamage + " left to repair in room.")
                if (creep.repair(bestRepair[0]) == ERR_NOT_IN_RANGE) {
                    path(creep, bestRepair);
                }
            } else {
                creep.memory.idle += 1
                if (creep.memory.idle >= 15) {
                    log(c, creep.name + " is bored and wants to die.")
                    if (creep.room.find(FIND_MY_SPAWNS)[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                        path(creep, creep.room.find(FIND_MY_SPAWNS)[0])
                    }
                }
            }
        } else {
            var t = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => structure.structureType == 'container' && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            var targets = t.sort(function (a, b) {
                return b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
            })
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
            var energyDif = creep.room.energyCapacityAvailable - creep.room.energyAvailable
            var spawn1 = Game.rooms[creep.room.name].find(FIND_MY_SPAWNS)[0]
            var creepsTakingFromSpawn = _.filter(Game.creeps, (creep) => creep.memory.takingFromSpawn == true)
            var damagedRoads = _.filter(sv.roads, (structure) => structure.hits < structure.hitsMax)
            if (energyDif > 0 && creepsTakingFromSpawn.length >= 1) {
                creep.memory.takingFromSpawn = false;
            }
            dropped = dropped.sort(function (a, b) {
                return b.amount - a.amount
            })


            if (dropped.length > 0) {
                log(c, creep.name + " is picking up dropped resources.")
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    path(creep, dropped)
                }
            } else if (energyDif == 0 && creepsTakingFromSpawn.length == 0) {
                creep.memory.takingFromSpawn = true;
                log(c, creep.name + " is grabbing energy from spawn.")
                if (creep.withdraw(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, spawn1)
                }
            } else if (targets.length > 0) {
                log(c, creep.name + " is grabbing energy from the most full container.")
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, targets)
                }
            } else if (sv.storage && sv.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                log(c, creep.name + " is grabbing energy from storage.")
                if (creep.withdraw(sv.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    path(creep, sv.storage)
                }
            } else {
                creep.memory.idle += 1
                log(c, creep.name + " is bored and wants to die.")
                if (creep.memory.idle >= 15 && spawn1.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    path(creep, spawn1)
                }
            }

            /*var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
            var sources = creep.room.find(FIND_SOURCES);
            for(var i in sources){
                if(hostileStructures.length > 0 && sources[i].pos.getRangeTo(hostileStructures[0].pos) < 10) {
                            //console.log("Ignoring Source: "+sources[i].id+" Due To Hostile Presence");
                            continue;
                        }
                var fields = creep.room.lookForAtArea(LOOK_TERRAIN, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
                var occupied = creep.room.lookForAtArea(LOOK_CREEPS, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
                var accessibleFields = 9-_.countBy( fields , "terrain" ).wall;
                var spots = accessibleFields - occupied.length
                //console.log("Source: "+sources[i].id+" has: " + (accessibleFields-occupied.length) +" of "+accessibleFields+" available.")
                if(spots == 0 && sources[i].pos.getRangeTo(creep.pos)>1){
                    console.log(creep.name+ " Sees no available spots at Source: "+sources[i].id)
                    continue;
                } else if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE && spawn1.store.getUsedCapacity(RESOURCE_ENERGY) < 200) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#FF0000'}});
                }

            }*/


        }
    }

};

module.exports = roleBuilder;