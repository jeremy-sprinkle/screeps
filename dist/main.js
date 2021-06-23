var roleHarvester = require('roleHarvester');
var roleUpgrader = require('roleUpgrader');
var roleBuilder = require('roleBuilder');
var roleCourier = require('roleEnergyCourier');
var roleRampartRepair = require('roleRampartRepair');
var roleRoamingHarvester = require('roleRoamingHarvester');

var spawnRoamingHarvester = require('spawnRoamingHarvester');
var spawnHarvester = require('spawnHarvester');
var spawnBuilder = require('spawnBuilder');
var spawnCourier = require('spawnCourier');
var spawnMilitaryBuilder = require('spawnMilitaryBuilder');
var spawnRoomUpgrader = require('spawnRoomUpgrader');

var E34N47energyChange = []
var E34N47levelChange = []

module.exports.loop = function () {
    console.log("------------------------TICK BOUNDARY----------------------------")
    var names = []
    for(var roomi in Game.rooms){
        names.push(Game.rooms[roomi].name)
    }

    console.log("Rooms Active: "+names)

    //CLEAR DEAD CREEP MEMORY
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

     for(var c in Game.creeps){
        if(Game.creeps[c].ticksToLive < 25){
            console.log("Creep: "+ Game.creeps[c]+" expiring soon.")
        }
    }

    var GameCreeps = Object.values(Game.creeps)
    var cv = {
        gameCreeps: GameCreeps,
        harvesters: _.filter(GameCreeps, (creep) => creep.memory.role == "harvester"),
        hMax: 0,
        upgraders: _.filter(GameCreeps, (creep) => creep.memory.role == "upgrader"),
        uMax: 0,
        builders: _.filter(GameCreeps, (creep) => creep.memory.role == "builder"),
        bMax: 0,
        couriers: _.filter(GameCreeps, (creep) => creep.memory.role == "courier"),
        cMax: 0,
        rampartRepairers: _.filter(GameCreeps, (creep) => creep.memory.role == "rampartrepair"),
        rrMax: 0,
        roamingHarvesters :_.filter(GameCreeps, (creep) => creep.memory.role == "roamingharvester"),
        rhMax: 0
    }

    //EXECUTE CODE FOR EACH ROOM ACTIVE
    var GameRooms = Object.values(Game.rooms)

      for (i in GameRooms) {


        //ROOM VARIABLES
        if(GameRooms[i].controller.level>0)
        { var owner = GameRooms[i].controller.owner.username} else {
            var owner = "Room Unowned"
        }

        var rv = {
            gameRooms : GameRooms,
            controller : GameRooms[i].controller,
            currentRoom: GameRooms[i],
            roomName: GameRooms[i].name,
            roomEnergy: GameRooms[i].energyAvailable,
            roomEnergyCap: GameRooms[i].energyCapacityAvailable,
            roomEnergyPct: (GameRooms[i].energyAvailable/GameRooms[i].energyCapacityAvailable)*100,
            totalRoomEnergyPct: 0,
            rcl: GameRooms[i].controller.level,
            roomOwner: owner,
            ts: Game.time.toString().slice(5),
            energySources: GameRooms[i].find(FIND_SOURCES),
            cappedTime: Game.spawns['Spawn1'].memory.cappedTime
        };

            //COUNTING WASTED SPAWN TIME
        if (rv.roomEnergy == rv.roomEnergyCap) {
            Game.spawns['Spawn1'].memory.cappedTime++
        } else {
            Game.spawns['Spawn1'].memory.cappedTime = 0
        }

        var c = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container")
        var s = _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "storage")
        var total = rv.roomEnergyCap
        var current = rv.roomEnergy
        if(s.length){
            total += s[0].store.getCapacity(RESOURCE_ENERGY)
            current += s[0].store.getUsedCapacity(RESOURCE_ENERGY)
        }
        for(var con in c){
            total += c[con].store.getCapacity(RESOURCE_ENERGY)
            current += c[con].store.getUsedCapacity(RESOURCE_ENERGY)
        }

        rv.totalRoomEnergyPct = Math.floor((current/total)*100)


        //TRACKING ROOM ENERGY
        //FIX TO TRACK MULTIPLE ROOMS
            var tracker = E34N47energyChange
            tracker.push(current)
            if(tracker.length>200){
                tracker.shift()
            }

            var difEnergy
            var lastEnergy
            var trackedEnergyChange = 0
            var displayEnergyChange
            if(tracker.length>1){
                for(var t in tracker){
                    difEnergy = tracker[t] - lastEnergy
                    if(difEnergy > 0 || difEnergy < 0) {
                        trackedEnergyChange += difEnergy
                        if(trackedEnergyChange > 0){
                            displayEnergyChange = "+"+trackedEnergyChange.toString()
                        } else {
                            displayEnergyChange = trackedEnergyChange
                        }
                    }
                    lastEnergy = tracker[t]
                }
            }

        //TRACKING ROOM UPGRADE LEVEL
        var ltracker = E34N47levelChange
        ltracker.push(rv.controller.progress)
        if(ltracker.length>200){
            ltracker.shift()
        }

        var difLevel
        var lastLevel
        var trackedLevelChange = 0
        var displayLevelChange
        if(ltracker.length>1){
            for(var l in ltracker){
                difLevel = ltracker[l] - lastLevel
                if(difLevel > 0 || difLevel < 0) {
                    trackedLevelChange += difLevel
                    if(trackedLevelChange > 0){
                        displayLevelChange = "+"+trackedLevelChange.toString()
                    } else {
                        displayLevelChange = trackedLevelChange
                    }
                }
                lastLevel = ltracker[l]
            }
        }


        console.log("------------------------ROOM BOUNDARY----------------------------")
        console.log("RoomName: " + rv.roomName + " | Owner: " + rv.roomOwner + " " +
            "| Spawn Energy: " + rv.roomEnergy + "/" + rv.roomEnergyCap +
            " | Room Energy: " + current+"/"+total +"("+rv.totalRoomEnergyPct+"%)"+
            " | Energy Change("+tracker.length+"/200 ticks): " + displayEnergyChange +
            " | Average Change: " + Math.floor(trackedEnergyChange/tracker.length) +
            " | Level Change("+ltracker.length+"/200 ticks): " + displayLevelChange +
            " | Average Change: " + Math.floor(trackedLevelChange/ltracker.length)
            )

        //STRUCTURE VARIABLES
        var sv = {
            structures: GameRooms[i].find(FIND_STRUCTURES),
            hostileStructures: GameRooms[i].find(FIND_HOSTILE_STRUCTURES),
            containers: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container"),
            sourceContainers: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == 'container'
                && structure.pos.findInRange(FIND_SOURCES, 1).length),
            overflowContainers: _.filter(_.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "container"),
                (container) => container.pos.findInRange(FIND_SOURCES, 1) == 0),
            extensions: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "extension"),
            ramparts: _.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "rampart"),
            damagedRamparts : _.filter(_.filter(GameRooms[i].find(FIND_STRUCTURES), (structure) => structure.structureType == "rampart"),
                (rampart) => rampart.hits < (rampart.hitsMax*0.8) ),
            towers : _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "tower"),
            roads : _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "road"),
            storage : _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "storage"),
            spawns : _.filter(GameRooms[i].find(FIND_STRUCTURES), (struc) => struc.structureType == "spawn"),
        }
        //CREEP VARIABLES


        // ---------      MAIN CREEP AND BUILDING SPAWNING LOGIC      --------- //
        if (rv.roomOwner != 'TrickyMouse') {
            rv.rcl = -1
        }

        //---------------------------------------------//
        //-1: OCCUPIED ROOM - TO-DO: PVP CODE
        if (rv.rcl == -1) {
            console.log("What are we doing in room owned by " + rv.roomOwner + "?")
            //attackRoom.run();
        }

        //---------------------------------------------//
        //LEVEL 0: TO-DO: EXPLOIT AND NAVIGATE NEW ROOMS
        if (rv.rcl == 0) {
            console.log("Creeps appear to be lost in room " + rv.roomName + ".")
            //exploitRoom.run();
        }

        //---------------------------------------------//
        //LEVEL 1: CREATE ONE HARVESTER PER SOURCE, ONE CONTAINER PER HARVESTER AT SOURCE, ONE UPGRADER, ONE BUILDER
        if (rv.rcl == 1) {
            cv.hMax = rv.energySources.length //fix to remove hostile sources later
            cv.uMax = 1
            cv.bMax = 1

            //ENERGY HARVESTER<->SOURCE ASSIGNMENT - HARVESTERS CREATE CONTAINERS BY SOURCE
            for (i in rv.energySources) {
                spawnHarvester.run(rv.energySources[i], cv.hMax)
            }

            //UPGRADER SPAWNING
            spawnRoomUpgrader.run(rv, cv, sv);

            //BUILDER SPAWNING
            spawnBuilder.run(rv, cv, sv);

            //PRINT STATUS
            console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax +
                '\nUpgraders: ' + cv.upgraders.length + " of " + cv.uMax +
                '\nBuilders: ' + cv.builders.length + " of " + cv.bMax
            );
        }

        //---------------------------------------------//
        //LEVEL 2: CREATE 5 EXTENSIONS AND RAMPARTS
        //LEVEL 3: CREATE 5 EXTENSIONS AND TOWER

        if (rv.rcl > 1) {
            cv.hMax = rv.energySources.length //fix to remove hostile sources later
            cv.uMax = 1
            cv.bMax = 1
            cv.cMax = 1
            cv.rrMax = 0//sv.damagedRamparts.length

            if(!rv.currentRoom.storage){
                if(rv.totalRoomEnergyPct > 90){
                    cv.uMax = 2
                    cv.bMax = 2
                    if(rv.totalRoomEnergyPct > 95){
                        cv.uMax = 3
                        if(rv.totalRoomEnergyPct >= 99){
                            cv.uMax = 4
                        }
                    }
                }
            } else {
                if(rv.totalRoomEnergyPct > 10){
                    cv.uMax = 2
                    cv.bMax = 2
                    if(rv.totalRoomEnergyPct > 15){
                        cv.uMax = 3
                        if(rv.totalRoomEnergyPct >= 20){
                            cv.uMax = 4
                        }
                    }
                }
            }


            if(rv.currentRoom.find(FIND_CONSTRUCTION_SITES).length == 0){
                cv.bMax = 0
            }

            //ENERGY HARVESTER<->SOURCE ASSIGNMENT
            for (var source in rv.energySources) {
                spawnHarvester.run(rv.energySources[source], cv.hMax)
            }
            //COURIER SPAWNING
            spawnCourier.run(rv, cv, sv)
            //RAMPART REPAIRER SPAWNING
            spawnMilitaryBuilder.run(rv, cv, sv);
            //UPGRADER SPAWNING
            spawnRoomUpgrader.run(rv, cv, sv);

            //BUILDER SPAWNING
            spawnBuilder.run(rv, cv, sv);

            //PRINT STATUS
            console.log('Harvesters: ' + cv.harvesters.length + " of " + cv.hMax +
                '\nCouriers: ' + cv.couriers.length + " of " + cv.cMax +
                '\nUpgraders: ' + cv.upgraders.length +
                '\nBuilders: ' + cv.builders.length
            );

        }
    }


    //MANUAL FLAG MANAGEMENT
    // var foreignSources = [Game.flags['ForeignSource1'].room.lookAt(Game.flags['ForeignSource1'].pos)[0].source.id]

    for(var flag in Game.flags){
        if(Game.flags[flag].name.includes("source")){
            if(_.filter(Game.creeps, (creep) => creep.memory.target == Game.flags[flag].name).length || cv.roamingHarvesters.length > 0){
                continue;
            } else {
                spawnRoamingHarvester.run(Game.flags[flag].pos,rv,sv,cv)
            }
        }
    }


    //Spawn labelling
    for(var sp in sv.spawns){
        if (sv.spawns[sp].spawning) {
            var spawningCreep = Game.creeps[sv.spawns[sp].spawning.name];
            sv.spawns[sp].room.visual.text(
                'Spawning ' + spawningCreep.memory.role,
                sv.spawns[sp].pos.x - 3,
                sv.spawns[sp].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    //Tower behaviour - move to separate module?
    for(var t in sv.towers){
        if (sv.towers[t] && sv.towers[t].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {

            var closestHostile = sv.towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                sv.towers[t].attack(closestHostile);
                console.log("Tower attacking "+closestHostile)
            } else if(rv.totalRoomEnergyPct > 15){

                var closestFriend = sv.towers[t].pos.findClosestByRange(FIND_MY_CREEPS);
                var closestDamagedStructure = sv.towers[t].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                        && structure.structureType != "road" && structure.structureType != "constructedWall"
                });
                var secondRateDamagedStructure = sv.towers[t].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != "constructedWall"
                });
                if(closestFriend && closestFriend.hits < closestFriend.hitsMax) {
                    sv.towers[t].heal(closestFriend);

                    console.log("Tower healing "+closestFriend)
                }else if (closestDamagedStructure) {
                    sv.towers[t].repair(closestDamagedStructure);
                    //console.log("Tower repairing "+closestDamagedStructure+".")
                } else if (secondRateDamagedStructure && rv.totalRoomEnergyPct > 50) {
                    sv.towers[t].repair(secondRateDamagedStructure);
                }
            }


        }
    }


    //Creep behaviour
    for (var name in GameCreeps) {
        var creep = GameCreeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep, sv);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep,sv);
        }
        if (creep.memory.role == 'courier') {
            roleCourier.run(creep,rv,sv);
        }
        if (creep.memory.role == 'rampartrepair') {
            roleRampartRepair.run(creep, sv.ramparts,rv);
        }
        if (creep.memory.role == 'roamingharvester'){
            roleRoamingHarvester.run(creep)
        }
    }
}