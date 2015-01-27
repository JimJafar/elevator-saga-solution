{
    init: function(elevators, floors) {
        var peopleWaitingAtFloors = {};
        
        floors.forEach(function(floor) {
            peopleWaitingAtFloors[floor.floorNum()] = { up: false, down: false };
        });
        
        var getDirection = function(elevator) {
            if(elevator.destinationQueue.length > 0) {
                return (elevator.currentFloor < elevator.destinationQueue[0]) ? 'up' : 'down';
            } else {
                return 'idle';
            }
        };
        
        var isPassing = function(elevator, floorNum, direction) {
            var elevatorDirection = getDirection(elevator);
            if (elevatorDirection !== direction) {
                return false;
            }
            
            return (elevatorDirection === 'up' && floorNum > elevator.currentFloor && floorNum < elevator.destinationQueue[0]) ||
                   (elevatorDirection === 'down' && floorNum < elevator.currentFloor && floorNum > elevator.destinationQueue[0]);
        };
        
        var setDirectionIndicators = function(elevator) {
            if(elevator.currentFloor < elevator.destinationQueue[0]) {
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(false);
            } else {
                elevator.goingUpIndicator(false);
                elevator.goingDownIndicator(true);
            }
        };
        
        var queueIt = function(elevator, floorNum) {
            
            if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                console.log('queueing floor '+floorNum);
                
                elevator.destinationQueue.push(floorNum);
                
                if(elevator.destinationQueue.length === 1) {
                    return;
                }
                
                var higher = elevator.destinationQueue.filter(function(num) { return num > floorNum; });
                var lower = elevator.destinationQueue.filter(function(num) { return num <= floorNum; });
                higher.sort();
                lower.sort();
                lower.reverse();
                
                elevator.destinationQueue = (elevator.goingUpIndicator()) ? higher.concat(lower) : lower.concat(higher);
                
                elevator.checkDestinationQueue();
                console.log(elevator.destinationQueue);
            }
        };
        
        var pickUp = function(elevator, direction) {
            console.log('attempting pickup');
            console.log(peopleWaitingAtFloors);
            var found = false;
            if(direction === 'up') {
                for (var i=elevator.currentFloor; i<floors.length; i++) {
                    if(peopleWaitingAtFloors[i].up) {
                        elevator.goToFloor(i);
                        peopleWaitingAtFloors[i].up = false;
                        found = true;
                        break;
                    }
                }
            } else {
                for (var i=elevator.currentFloor; i>0; i--) {
                    if(peopleWaitingAtFloors[i].down) {
                        elevator.goToFloor(i);
                        peopleWaitingAtFloors[i].down = false;
                        found = true;
                        break;
                    }
                }
            }
            if(found) { console.log('found someone!'); } else { console.log('found noone!'); }
            return found;
        };
        
        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                if(elevator.currentFloor < floors.length/2) {
                    if (!pickUp(elevator, 'up')) {
                        if(!pickUp(elevator, 'down')) {
                            elevator.goToFloor(0);
                        }
                    }
                } else {
                    if (!pickUp(elevator, 'down')) {
                        if (!pickUp(elevator, 'up')) {
                            elevator.goToFloor(0);
                        }
                    }
                }
                
            });
            elevator.on('floor_button_pressed', function(floorNum) {
                queueIt(elevator, floorNum);
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                setDirectionIndicators(elevator);
                if (elevator.loadFactor < 0.7 && peopleWaitingAtFloors[floorNum][direction]) {
                    elevator.goToFloor(floorNum, true);
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                peopleWaitingAtFloors[floorNum][getDirection(elevator)] = false;
                if(floorNum === 0) { elevator.goingUpIndicator(true); elevator.goingDownIndicator(false); }
            });
        });
        
        floors.forEach(function(floor) {
            var handleFloorButtonPress = function(direction) {
                var selectedElevator = null;
                
                elevators.forEach(function(elevator) {
                    if(elevator.loadFactor < 0.7 && isPassing(elevator, floor.floorNum(), direction)) {
                        selectedElevator = elevator;
                    }
                });
                
                if(selectedElevator) {
                    elevator.goToFloor(floor.floorNum(), true);
                } else {
                    peopleWaitingAtFloors[floor.floorNum()][direction] = true;
                }
            };
            floor.on("up_button_pressed", function() {
                handleFloorButtonPress('up');
            });
            floor.on("down_button_pressed", function() {
                handleFloorButtonPress('down');
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
