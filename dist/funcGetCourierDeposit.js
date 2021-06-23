function getCourierDeposit(creep,sv){

    if(creep.memory.movingTo && Game.getObjectById(creep.memory.movingTo)== null){
        console.log(creep.name+" memory object null - clearing memory.")
        creep.memory.movingTo = null

    }
    if(creep.transfer(Game.getObjectById(creep.memory.movingTo)) == OK){
        creep.memory.movingTo = null
    }
    if(creep.memory.movingTo && Game.getObjectById(creep.memory.movingTo).store.getFreeCapacity(RESOURCE_ENERGY) > 0){
        return Game.getObjectById(creep.memory.movingTo);
    } else {
        console.log(creep.name+" clearing memory.")
        creep.memory.movingTo = null
    }

    var extensions = _.filter(sv.extensions, (e) => e.store.getFreeCapacity(RESOURCE_ENERGY)>0)
    if(extensions.length){
        var weightedExtensions = []
        for(var e in extensions){
            var pathLength = creep.room.findPath(creep.pos, extensions[e].pos, {ignoreCreeps: true}).length
            weightedExtensions.push({weight:pathLength,store:extensions[e]})
        }
        var target = weightedExtensions.sort(function(a, b){
            return a.weight-b.weight})[0].store;
        creep.memory.movingTo = target.id
        return target;
    }

    var spawns = _.filter(sv.spawns, (s) => s.store.getFreeCapacity(RESOURCE_ENERGY)>0)
    if(spawns.length){
        var weightedSpawns = []
        for(var s in spawns){
            var pathLength = creep.room.findPath(creep.pos, spawns[s].pos, {ignoreCreeps: true}).length
            weightedSpawns.push({weight:pathLength,store:spawns[s]})
        }
        var target = weightedSpawns.sort(function(a, b){
            return a.weight-b.weight})[0].store;
        creep.memory.movingTo = target.id
        return target;
    }

    var towers = _.filter(sv.towers, (t) => t.store.getFreeCapacity(RESOURCE_ENERGY)>0)
    if(towers.length){
        var weightedTowers = []
        for(var t in towers){
            var pathLength = creep.room.findPath(creep.pos, towers[t].pos, {ignoreCreeps: true}).length
            weightedTowers.push({weight:pathLength,store:towers[t]})
        }
        var target = weightedTowers.sort(function(a, b){
            return a.weight-b.weight})[0].store;
        creep.memory.movingTo = target.id
        return target;
    }

    var containers = _.filter(sv.overflowContainers, (container) => container.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getUsedCapacity(RESOURCE_ENERGY))
    if(containers.length){
        var weightedContainers = []
        for(var c in containers){
            var pathLength = creep.room.findPath(creep.pos, containers[c].pos, {ignoreCreeps: true}).length
            weightedContainers.push({weight:pathLength,store:containers[c]})
        }
        var target = weightedContainers.sort(function(a, b){
            return a.weight-b.weight})[0].store;
        creep.memory.movingTo = target.id
        return target;
    }

    if(creep.room.storage) {
        var target = creep.room.storage;
        creep.memory.movingTo = target.id
        return target;
    }

    var containers = _.filter(sv.overflowContainers, (container) => container.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    if(containers.length){
        var weightedContainers = []
        for(var c in containers){
            var pathLength = creep.room.findPath(creep.pos, containers[c].pos, {ignoreCreeps: true}).length
            weightedContainers.push({weight:pathLength,store:containers[c]})
        }
        var target = weightedContainers.sort(function(a, b){
            return a.weight-b.weight})[0].store;
        creep.memory.movingTo = target.id
        return target;
    }

}

module.exports = getCourierDeposit;