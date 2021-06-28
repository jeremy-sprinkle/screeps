var log = require('funcLogging');

var roleHarvester = require('roleHarvester');
var roleUpgrader = require('roleUpgrader');
var roleBuilder = require('roleBuilder');
var roleCourier = require('roleEnergyCourier');
var roleRampartRepair = require('roleRampartRepair');
var roleFlagHarvester = require('roleFlagHarvester');
var roleFlagAttacker = require('roleFlagAttacker');
var roleFlagAttackerRanged = require('roleFlagAttackerRanged');
var roleFlagClaimer = require('roleFlagClaimer');
var roleFlagBuilder = require('roleFlagBuilder');
var roleFlagReserver = require('roleFlagReserver');
var roleFlagCourier = require('roleFlagCourier');
var roleLinkMonkey = require('roleLinkMonkey');
var roleAlertDefenderRanged = require('roleAlertDefenderRanged')

var spawnAlertDefenderRanged = require('spawnAlertDefenderRanged')
var spawnLinkMonkey = require('spawnLinkMonkey');
var spawnFlagCourier = require('spawnFlagCourier');
var spawnFlagHarvester = require('spawnFlagHarvester');
var spawnHarvester = require('spawnHarvester');
var spawnBuilder = require('spawnBuilder');
var spawnCourier = require('spawnCourier');
var spawnMilitaryBuilder = require('spawnMilitaryBuilder');
var spawnRoomUpgrader = require('spawnRoomUpgrader');
var spawnFlagAttacker = require('spawnFlagAttacker');
var spawnFlagAttackerRanged = require('spawnFlagAttackerRanged');
var spawnFlagClaimer = require('spawnFlagClaimer');
var spawnFlagBuilder = require('spawnFlagBuilder');
var spawnFlagReserver = require('spawnFlagReserver');

//WIP DECLARING USEFUL ARRAYS AND OBJECTS TO STORE ACROSS MULTIPLE TICKS, SAVING ON FIND CALLS
var myRooms = _.filter(Game.rooms, (room) => room.controller.owner && room.controller.owner == "TrickyMouse")
var mySources = [] //Expect {"room":[source1,source2]}


global.logging = {}
global.logging.roles = true;
global.logging.cpu = false;
global.logging.path = false;
var cpu = global.logging.cpu

global.alerts = []

let tracker = []

function trackerObject(r, l, e) {
    this.room = r;
    this.get = {
        level: l,
        energy: e
    }
}

global.spawning = {}
global.spawning.flagspawns = true


module.exports.loop = function () {
    console.log("------------------------TICK BOUNDARY----------------------------")
    var cpuTrace1 = Game.cpu.getUsed()

    var names = []
    for (var roomi in Game.rooms) {
        names.push(Game.rooms[roomi].name)
    }

    console.log("Rooms Active: " + names)

    //CLEAR DEAD CREEP MEMORY
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var c in Game.creeps) {
        if (Game.creeps[c].ticksToLive < 25) {
            console.log("Creep: " + Game.creeps[c] + " expiring soon.")
        }
    }


    var cpuTrace2 = Game.cpu.getUsed() // FOR PRE-LOOP CPU COSTS


    //EXECUTE CODE FOR EACH OWNED ROOM ACTIVE
    var GameRooms = Object.values(Game.rooms)
    var GameCreeps = Object.values(Game.creeps)
    for (var i in GameRooms) {
        if (GameRooms[i].controller.owner && GameRooms[i].controller.owner.username == "TrickyMouse") {


            //ROOM VARIABLES - TODO: Check if global array is empty, only use FIND then
            var rv = null
            var rv = {
                gameRooms: GameRooms,
                controller: GameRooms[i].controller,
                currentRoom: GameRooms[i],
                roomName: GameRooms[i].name,
                roomEnergy: GameRooms[i].energyAvailable,
                roomEnergyCap: GameRooms[i].energyCapacityAvailable,
                roomEnergyPct: (GameRooms[i].energyAvailable / GameRooms[i].energyCapacityAvailable) * 100,
                totalRoomEnergyPct: 0,
                rcl: GameRooms[i].controller.level,
                roomOwner: GameRooms[i].controller.owner,
                ts: Game.time.toString().slice(5),
                energySources: GameRooms[i].find(FIND_SOURCES),
            };


            var c = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container")
            var s = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "storage")
            var total = rv.roomEnergyCap
            var current = rv.roomEnergy
            if (s.length) {
                total += s[0].store.getCapacity(RESOURCE_ENERGY)
                current += s[0].store.getUsedCapacity(RESOURCE_ENERGY)
            }
            for (var con in c) {
                total += c[con].store.getCapacity(RESOURCE_ENERGY)
                current += c[con].store.getUsedCapacity(RESOURCE_ENERGY)
            }

            rv.totalRoomEnergyPct = Math.floor((current / total) * 100)


            /*//TRACKING ROOM ENERGY
            //FIX TO TRACK MULTIPLE ROOMS
            var trackRoom = rv.currentRoom.name
            console.log(trackRoom)
            var trackLevel = current
            console.log(trackLevel)
            var trackEnergy = rv.controller.progress
            console.log(trackEnergy)

            let trackerEntry = new trackerObject(trackRoom, trackLevel, trackEnergy);
            tracker.push(trackerEntry)

            energyTrackers.push({current})
            if (tracker.length > 200) {
                tracker.shift()
            }

            var difEnergy, lastEnergy, displayEnergyChange, difLevel, lastLevel, displayLevelChange
            var trackedEnergyChange = 0, trackedLevelChange = 0
            var displayEnergyChange = 0, displayLevelChange = 0

            if (tracker.length > 5) {

                var tRoom = _.filter(tracker, (t) => t.room == rv.currentRoom.name)

                for (var r = 1; r < tRoom.length; r++) {
                    difEnergy =  tRoom[r].get.energy - lastEnergy
                    if (difEnergy > 0 || difEnergy < 0) {
                        trackedEnergyChange += difEnergy
                        if (trackedEnergyChange > 0) {
                            displayEnergyChange = "+" + trackedEnergyChange.toString()
                        } else {
                            displayEnergyChange = trackedEnergyChange
                        }
                    }
                    lastEnergy = tRoom[r].get.energy

                    difLevel = tRoom[r].get.level - lastLevel
                    if (difLevel > 0 || difLevel < 0) {
                        trackedLevelChange += difLevel
                        if (trackedLevelChange > 0) {
                            displayLevelChange = "+" + trackedLevelChange.toString()
                        } else {
                            displayLevelChange = trackedLevelChange
                        }
                    }
                    lastLevel = tRoom[r].get.level

                }
            } else {
                displayEnergyChange = "Tracker Populating"
                displayLevelChange = "Tracker Populating"
            }
*/

            //STRUCTURE VARIABLES
            var sv = null
            var structures = GameRooms[i].find(FIND_STRUCTURES)

            var sv = {
                structures: structures,
                hostileStructures: GameRooms[i].find(FIND_HOSTILE_STRUCTURES),
                containers: _.filter(structures, (structure) => structure.structureType == "container"),
                sourceContainers: _.filter(structures, (structure) => structure.structureType == 'container'
                    && structure.pos.findInRange(FIND_SOURCES, 1).length),
                overflowContainers: _.filter(_.filter(structures, (structure) => structure.structureType == "container"),
                    (container) => container.pos.findInRange(FIND_SOURCES, 1) == 0),
                extensions: _.filter(structures, (structure) => structure.structureType == "extension"),
                ramparts: _.filter(structures, (structure) => structure.structureType == "rampart"),
                damagedRamparts: _.filter(_.filter(structures, (structure) => structure.structureType == "rampart"),
                    (rampart) => rampart.hits < (rampart.hitsMax)),
                damaged: _.filter(_.filter(structures, (structure) => structure.hits < structure.hitsMax)),
                towers: _.filter(structures, (struc) => struc.structureType == "tower"),
                roads: _.filter(structures, (struc) => struc.structureType == "road"),
                storage: GameRooms[i].storage,
                spawns: _.filter(structures, (struc) => struc.structureType == "spawn"),
                sites: _.filter(GameRooms[i].find(FIND_CONSTRUCTION_SITES)),
                links: _.filter(structures, (struc) => struc.structureType == "link"),
                storeLink: _.filter(structures, (struc) => struc.structureType == "link" && struc.pos.inRangeTo(GameRooms[i].storage, 3))[0]
            }

            Game.getObjectById("60d8ab8d647c58fc7b2662bb").transferEnergy(Game.getObjectById("60d8a928dc57cf6743034b32"))

            for (var sp in sv.spawns) {
                if (sv.spawns[sp].spawning) {
                    var spawningCreep = Game.creeps[sv.spawns[sp].spawning.name];
                    sv.spawns[sp].room.visual.text(
                        'Spawning ' + spawningCreep.memory.role,
                        sv.spawns[sp].pos.x - 3,
                        sv.spawns[sp].pos.y,
                        {align: 'left', opacity: 0.8});
                }
            }

            //CREEP VARIABLES
            var cv = null
            var cv = {
                gameCreeps: GameCreeps,
                harvesters: _.filter(GameCreeps, (creep) => creep.memory.role == "harvester" && creep.memory.workroom == rv.currentRoom.name),
                hMax: 0,
                upgraders: _.filter(GameCreeps, (creep) => creep.memory.role == "upgrader" && creep.memory.workroom == rv.currentRoom.name),
                uMax: 0,
                builders: _.filter(GameCreeps, (creep) => creep.memory.role == "builder" && creep.memory.workroom == rv.currentRoom.name),
                bMax: 0,
                couriers: _.filter(GameCreeps, (creep) => creep.memory.role == "courier" && creep.memory.workroom == rv.currentRoom.name),
                cMax: 0,
                rampartRepairers: _.filter(GameCreeps, (creep) => creep.memory.role == "rampartrepair" && creep.memory.workroom == rv.currentRoom.name),
                rrMax: 0,
                roamingHarvesters: _.filter(GameCreeps, (creep) => creep.memory.role == "roamingharvester" && creep.memory.workroom == rv.currentRoom.name),
                rhMax: 0,
                linkMonkeys: _.filter(GameCreeps, (creep) => creep.memory.role == "linkmonkey" && creep.memory.workroom == rv.currentRoom.name),
                lmMax: 0,
            }

            console.log("------------------------ROOM: " + rv.roomName + " | RCL: " + rv.controller.level + "----------------------------")
            console.log("|-- Spawn Energy: " + rv.roomEnergy + "/" + rv.roomEnergyCap +
                " | Room Energy: " + current + "/" + total + "(" + rv.totalRoomEnergyPct + "%)" +
                /* " | Energy Change(" + tracker.length + "/200 ticks): " + displayEnergyChange +
                 " | Average Change: " + Math.floor(trackedEnergyChange / tracker.length) +
                 " | Level Change(" + tracker.length + "/200 ticks): " + displayLevelChange +
                 " | Average Change: " + Math.floor(trackedLevelChange / tracker.length)
                 +*/ " --|"
            )


            // ---------      MAIN CREEP AND BUILDING SPAWNING LOGIC      --------- //

            //---------------------------------------------//

            var phase
            const NEW_ROOM = 0
            if (true) {
                phase = NEW_ROOM
            }

            //LEVEL 1:
            if (rv.rcl == 1) {
                cv.hMax = rv.energySources.length //fix to remove hostile sources later

                //ENERGY HARVESTER<->SOURCE ASSIGNMENT - HARVESTERS CREATE CONTAINERS BY SOURCE
                for (i in rv.energySources) {
                    spawnHarvester.run(rv.energySources[i], cv.hMax, sv, rv)
                }

                //PRINT STATUS
                console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax
                );
            }

            //---------------------------------------------//
            //LEVEL 2:

            if (rv.rcl > 1) {
                cv.hMax = rv.energySources.length //fix to remove hostile sources later
                cv.uMax = 1
                cv.bMax = 1
                cv.cMax = 1
                cv.rrMax = 0

                if (rv.currentRoom.storage) {
                    if (rv.totalRoomEnergyPct > 30) {
                        cv.uMax = 2
                        if (rv.totalRoomEnergyPct > 50) {
                            cv.uMax = 3
                        }
                    }

                    if (sv.links.length == 2) {
                        cv.lmMax = 1
                    }
                }


                if (rv.currentRoom.find(FIND_CONSTRUCTION_SITES).length == 0 && sv.damaged.length == 0) {
                    cv.bMax = 0
                }
                if (rv.rcl < 3) {
                    cv.bMax = 0
                }
                if (sv.containers.length == 0) {
                    cv.cMax = 0
                }

                //ENERGY HARVESTER<->SOURCE ASSIGNMENT
                for (var source in rv.energySources) {
                    spawnHarvester.run(rv.energySources[source], cv.hMax, sv, rv)
                }
                //COURIER SPAWNING
                spawnCourier.run(rv, cv, sv)
                //BUILDER SPAWNING
                spawnBuilder.run(rv, cv, sv);
                //RAMPART REPAIRER SPAWNING
                spawnMilitaryBuilder.run(rv, cv, sv);
                //UPGRADER SPAWNING
                spawnRoomUpgrader.run(rv, cv, sv);
                //LINKMONKEY SPAWNING
                spawnLinkMonkey.run(rv, cv, sv);


                //PRINT STATUS
                console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax +
                    '\nCouriers: ' + cv.couriers.length + " of " + cv.cMax +
                    '\nUpgraders: ' + cv.upgraders.length + " of " + cv.uMax +
                    '\nBuilders: ' + cv.builders.length + " of " + cv.bMax
                );
            }

            if(cv.harvesters.length<cv.hMax || cv.couriers.length<cv.cMax || cv.upgraders.length<cv.uMax || cv.builders.length<cv.bMax){
                global.spawning.flagspawns = false
            } else {
                global.spawning.flagspawns = true
            }

            //Creep behaviour
            for (var name in GameCreeps) {
                var preHCPU = Game.cpu.getUsed()
                var creep = GameCreeps[name];

                if (creep.memory.role == 'harvester' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleHarvester.run(creep, sv, cv, rv);
                }
                var hCPU = Game.cpu.getUsed()
                //console.log("Harvester CPU: "+Math.floor(hCPU-preHCPU))
                if (creep.memory.role == 'upgrader' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleUpgrader.run(creep, sv, cv, rv);
                }
                var uCPU = Game.cpu.getUsed()
                //console.log("Upgrader CPU: "+Math.floor(uCPU-hCPU))
                if (creep.memory.role == 'builder' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleBuilder.run(creep, sv, cv, rv);
                }
                var bCPU = Game.cpu.getUsed()
                //console.log("Builder CPU: "+Math.floor(bCPU-uCPU))
                if (creep.memory.role == 'courier' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleCourier.run(creep, rv, sv);
                }
                var cCPU = Game.cpu.getUsed()
                //console.log("Courier CPU: "+Math.floor(cCPU-bCPU))
                if (creep.memory.role == 'rampartrepair' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleRampartRepair.run(creep, sv.ramparts, rv);
                }
                var mbCPU = Game.cpu.getUsed()
                //console.log("Mil. Builder CPU: "+Math.floor(mbCPU-cCPU))

                if (creep.memory.role == 'linkmonkey' && !creep.spawning && creep.memory.workroom == rv.currentRoom.name) {
                    roleLinkMonkey.run(creep, sv, cv, rv);
                }
            }

        }
    }

    var cpuTrace3 = Game.cpu.getUsed()  // FOR LOOP CPU COSTS

    //END OF ROOM LOOP
////////////////////////////////////////////////////////////////////////////////////////////
    //MANUAL FLAG MANAGEMENT


    var sourceFlags = _.filter(Game.flags, (flag) => flag.name.includes("source"))
    var claimFlags = _.filter(Game.flags, (flag) => flag.name.includes("claim"))
    var buildFlags = _.filter(Game.flags, (flag) => flag.name.includes("build"))
    var reserveFlags = _.filter(Game.flags, (flag) => flag.name.includes("reserve"))

    if(global.spawning.flagspawns){
        if (global.alerts.length) {
            for (var a in global.alerts) {
                console.log("ALERT: " + global.alerts[a])
                var responder = _.filter(GameCreeps, (creep) => creep.memory.targetRoom == global.alerts[a].room && creep.memory.role == "alertdefender")
                console.log("RESPONDER: " + responder)
                if (responder.length == 0) {
                    console.log("QUEUEING SPAWN TO COMBAT ALERT: " + global.alerts[a].room)
                    spawnAlertDefenderRanged.run(global.alerts[a].room, rv)
                }
                if ((Game.time - global.alerts[a].time) > global.alerts[a].timer) {
                    console.log("Removed Timed Out Alert: " + global.alerts[a].room)
                    global.alerts.splice(global.alerts[a], 1)
                }
            }
        } else {
            // ALL OTHER FLAG OPERATIONS
            var weightedFlags = []
            for (var sflag in sourceFlags) {
                for (var r in GameRooms) {
                    var name = sourceFlags[sflag].pos.roomName
                    var distance = Game.map.getRoomLinearDistance(GameRooms[r].name, name)
                    weightedFlags.push({distance: distance, flag: sourceFlags[sflag]})
                }
            }
            var sF = weightedFlags.sort(function (a, b) {
                return a.distance - b.distance
            })

            var sortedFlags = sF.splice(1)

            for (var flag in sortedFlags) {
                var flagCreeps = _.filter(GameCreeps, (creep) => creep.memory.targetRoom == sortedFlags[flag].flag.pos.roomName
                    && creep.memory.targetX == sortedFlags[flag].flag.pos.x &&
                    creep.memory.targetY == sortedFlags[flag].flag.pos.y &&
                    creep.memory.role == 'flagharvester'
                )
                if (flagCreeps.length > 0) {
                    if (flagCreeps[0].memory.storeCreated == true) {
                        var p = PathFinder.search(sv.spawns[0].pos, sortedFlags[flag].pos).path.length
                        console.log("flag harvest creep: path length: " + p + " | ticks left: " + flagCreeps[0].ticksToLive + " | flagcreeps total:  " + flagCreeps.length)
                        if (flagCreeps[0].ticksToLive < p && flagCreeps.length < 2) {
                            spawnFlagHarvester.run(sortedFlags[flag].flag.pos, rv, sv, cv)
                        }
                        if (_.filter(GameCreeps, (creep) => creep.memory.targetRoom == sortedFlags[flag].flag.pos.roomName
                            && creep.memory.targetX == sortedFlags[flag].flag.pos.x &&
                            creep.memory.targetY == sortedFlags[flag].flag.pos.y &&
                            creep.memory.role == 'flagcourier'
                        ).length > 0) {
                            continue;
                        } else {
                            spawnFlagCourier.run(sortedFlags[flag].flag.pos, rv, sv, cv)
                        }
                    }
                    continue;
                } else {
                    spawnFlagHarvester.run(sortedFlags[flag].flag.pos, rv, sv, cv)
                }


            }
            for (var flag in attackFlags) {
                if (attackFlags[flag].room != undefined) {
                    var victim = attackFlags[flag].pos.lookFor(LOOK_STRUCTURES)[0]
                    if (victim) {
                        console.log("Attack underway on: " + victim + " with " + victim.hits + " hits left.")
                    }
                }
                if (_.filter(GameCreeps, (creep) => creep.memory.targetRoom == attackFlags[flag].pos.roomName
                    && creep.memory.targetX == attackFlags[flag].pos.x &&
                    creep.memory.targetY == attackFlags[flag].pos.y
                ).length >= attackFlags.length * 3 && _.filter(GameCreeps, (creep) => creep.memory.role == "flagrangedattacker").length >= attackFlags.length * 6) {
                    console.log("debug")
                    continue;
                } else {
                    if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagattacker").length < attackFlags.length * 3) {
                        spawnFlagAttacker.run(attackFlags[flag].pos, rv, sv, cv)
                    }
                    if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagrangedattacker").length < attackFlags.length * 3) {
                        spawnFlagAttackerRanged.run(attackFlags[flag].pos, rv, sv, cv)
                    }

                }
            }

            for (var flag in claimFlags) {
                if (_.filter(GameCreeps, (creep) => creep.memory.targetRoom == claimFlags[flag].pos.roomName
                    && creep.memory.targetX == claimFlags[flag].pos.x &&
                    creep.memory.targetY == claimFlags[flag].pos.y
                ).length >= claimFlags.length) {
                    continue;
                } else {
                    if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagclaimer").length < claimFlags.length) {
                        spawnFlagClaimer.run(claimFlags[flag].pos, rv, sv, cv)
                    }
                }
            }
            for (var flag in reserveFlags) {
                var flagCreeps = _.filter(GameCreeps, (creep) => creep.memory.targetRoom == reserveFlags[flag].pos.roomName
                    && creep.memory.targetX == reserveFlags[flag].pos.x &&
                    creep.memory.targetY == reserveFlags[flag].pos.y
                )
                if (flagCreeps.length) {
                    var p = PathFinder.search(sv.spawns[0].pos, reserveFlags[flag].pos).path.length
                    console.log("flag reserve creep: path length: " + p + " | ticks left: " + flagCreeps[0].ticksToLive + " | flagcreeps total:  " + flagCreeps.length)
                    if (flagCreeps[0].ticksToLive < p && flagCreeps.length < 2) {
                        spawnFlagReserver.run(reserveFlags[flag].pos, rv, sv, cv)
                    }
                    continue;
                } else {
                    if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagreserver").length < reserveFlags.length) {
                        spawnFlagReserver.run(reserveFlags[flag].pos, rv, sv, cv)
                    }
                }
            }
            for (var flag in buildFlags) {
                var flagCreeps = _.filter(GameCreeps, (creep) => creep.memory.targetRoom == buildFlags[flag].pos.roomName
                    && creep.memory.targetX == buildFlags[flag].pos.x &&
                    creep.memory.targetY == buildFlags[flag].pos.y)
                if (flagCreeps.length >= buildFlags.length) {
                    continue;
                } else {
                    if (_.filter(GameCreeps, (creep) => creep.memory.role == "flagbuilder").length < buildFlags.length) {
                        console.log("No flag creep found - spawning")
                        spawnFlagBuilder.run(buildFlags[flag].pos, rv, sv, cv)
                    } else if (flagCreeps[0].ticksToLive < 100) {
                        console.log("Flag creep low ticks left - spawning")
                        spawnFlagBuilder.run(buildFlags[flag].pos, rv, sv, cv)
                    }
                }
            }
        }
    }


    var attackFlags = _.filter(Game.flags, (flag) => flag.name.includes("attack"))
    console.log("Active Flags( Sources: " + sourceFlags.length +
        " | Offences: " + attackFlags.length +
        " | Claims: " + claimFlags.length +
        " | Reservations: " + reserveFlags.length +
        " )"
    )




    for (var cName in GameCreeps) {
        var creep = GameCreeps[cName]
        if (creep.memory.role == 'flagharvester' && !creep.spawning) {
            roleFlagHarvester.run(creep)
        }
        var fhCPU = Game.cpu.getUsed()
        //console.log("Flag Harvester CPU: "+Math.floor(fhCPU-mbCPU))

        if (creep.memory.role == 'flagattacker' && !creep.spawning) {
            roleFlagAttacker.run(creep)
        }
        var faCPU = Game.cpu.getUsed()
        //console.log("Flag Attacker CPU: "+Math.floor(faCPU-fhCPU))

        if (creep.memory.role == 'flagrangedattacker' && !creep.spawning) {
            roleFlagAttackerRanged.run(creep)
        }
        var farCPU = Game.cpu.getUsed()
        //console.log("Flag Attacker Ranged CPU: "+Math.floor(farCPU-faCPU))

        if (creep.memory.role == 'flagclaimer' && !creep.spawning) {
            roleFlagClaimer.run(creep)
        }
        var fcCPU = Game.cpu.getUsed()
        //console.log("Flag Claimer CPU: "+Math.floor(fcCPU-farCPU))

        if (creep.memory.role == 'flagbuilder' && !creep.spawning) {
            roleFlagBuilder.run(creep)
        }
        var fbCPU = Game.cpu.getUsed()

        if (creep.memory.role == 'flagreserver' && !creep.spawning) {
            roleFlagReserver.run(creep)
        }

        if (creep.memory.role == 'flagcourier' && !creep.spawning) {
            roleFlagCourier.run(creep)
        }

        if (creep.memory.role == 'alertdefender' && !creep.spawning) {
            roleAlertDefenderRanged.run(creep)
        }

    }

    var cpuTrace4 = Game.cpu.getUsed()  //FOR FLAG AND FLAG CREEP CPU COSTS

    //Tower behaviour - move to separate module?
    for (var t in sv.towers) {
        if (sv.towers[t] && sv.towers[t].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {

            var closestHostile = sv.towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                sv.towers[t].attack(closestHostile);
                console.log("Tower attacking " + closestHostile)
            } /*else if(rv.totalRoomEnergyPct > 15){

                var closestFriend = sv.towers[t].pos.findClosestByRange(FIND_MY_CREEPS);
                var damagedStructures = sv.towers[t].room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                        && structure.structureType != "road" && structure.structureType != "constructedWall"
                });
                var sortedDamagedStructures = damagedStructures.sort(function(a,b){return a.hits-b.hits})
                var secondRateDamagedStructure = sv.towers[t].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != "constructedWall"
                });
                if(closestFriend && closestFriend.hits < closestFriend.hitsMax) {
                    sv.towers[t].heal(closestFriend);

                    console.log("Tower healing "+closestFriend)
                }else if (sortedDamagedStructures) {
                    sv.towers[t].repair(sortedDamagedStructures[0]);
                    //console.log("Tower repairing "+closestDamagedStructure+".")
                } else if (secondRateDamagedStructure && rv.totalRoomEnergyPct > 10) {
                    sv.towers[t].repair(secondRateDamagedStructure);
                }
            }*/


        }
    }

    var cpuTrace5 = Game.cpu.getUsed()


    log(cpu, "CPU Pre Loop: " + (cpuTrace2 - cpuTrace1).toString().substring(0, 5))
    log(cpu, "CPU Loop: " + (cpuTrace3 - cpuTrace2).toString().substring(0, 5))
    log(cpu, "CPU Flags & Flag Creeps: " + (cpuTrace4 - cpuTrace3).toString().substring(0, 5))
    log(cpu, "CPU Towers: " + (cpuTrace5 - cpuTrace4).toString().substring(0, 5))
    log(cpu, "CPU Total: " + (cpuTrace5 - cpuTrace1).toString().substring(0, 5))

    log(cpu, "CPU Bucket: " + Game.cpu.bucket)
    if (Game.cpu.bucket == 10000) {
        if (Game.cpu.generatePixel() == OK)
            log(cpu, "Converted 10,000 CPU to 1 Pixel.")
    }
}