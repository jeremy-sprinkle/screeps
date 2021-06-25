var spawnHarvester = {
    run: function (source, hMax, sv) {
        console.log("sv in spawn harv: "+ sv)
        var roomHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == "harvester"
            && creep.memory.workroom == source.room.name);
        if (roomHarvesters.length >= hMax) {
            return;
        }

        var hostileStructures = source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 10);
        if (hostileStructures.length > 0) {
            console.log("Ignoring Source: " + source.id + " Due To Hostile Presence");
            return;
        }

        var activeHarvesters = _.filter(Game.creeps, (creep) => creep.memory.target == source.id
            && creep.memory.workroom == source.room.name)
        if (activeHarvesters.length > 0) {
            console.log("Creeps Active On Source:" + source.id + ":" + activeHarvesters);
            return;

        } else if (activeHarvesters.length == 0) {

            var harvesterParts = [MOVE, CARRY, WORK]
            var cost = BODYPART_COST.move + BODYPART_COST.carry + BODYPART_COST.work
            var hName = 'H'
            var affordableParts
            if(roomHarvesters.length == 0){
                affordableParts = Math.floor((source.room.energyAvailable - 101) / BODYPART_COST.work)
            } else {
                affordableParts = Math.floor((source.room.energyCapacityAvailable - 101) / BODYPART_COST.work)
                if(affordableParts>=5){
                    affordableParts=4
                }
                if(affordableParts == 0){
                    affordableParts = 1
                }
            }

            for (var parts = 0; parts < affordableParts; parts++) {
                harvesterParts.push(WORK)
                cost += BODYPART_COST.work
            }
            var spawn1 = sv.spawns[0]
            var ts = Game.time.toString().slice(5)
            if (roomHarvesters.length < hMax && !spawn1.spawning
                && source.room.energyAvailable >= cost) {
                console.log('Spawning new harvester: ' + hName + ts);
                spawn1.spawnCreep(harvesterParts, hName + ts,
                    {
                        memory: {
                            role: 'harvester',
                            target: source.id,
                            workroom: source.room.name
                        }
                    });
            } else {
                console.log("No Creeps Active On Source:" + source.id + ": Spawning Failing (Spawn Energy: " + source.room.energyAvailable + ", Required Energy: " + cost + ")")
            }
        }

    }
}

module.exports = spawnHarvester;