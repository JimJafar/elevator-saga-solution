{
    init: function(elevators, floors) {
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
        
        var isHeadingThatWay = function(elevator, floorNum, direction) {
            var elevatorDirection = getDirection(elevator);
            if (elevatorDirection !== direction) {
                return false;
            }
            return (elevatorDirection === 'up' && floorNum > elevator.currentFloor) ||
                   (elevatorDirection === 'down' && floorNum < elevator.currentFloor);
        };
        
        var hasRoom = function(elevator) {
            return elevator.loadFactor < 0.7;
        };
        
        var setDirectionIndicators = function(elevator) {
            return;
            
            if(elevator.currentFloor() === 0) { 
                elevator.goingUpIndicator(true); elevator.goingDownIndicator(false); 
                return;
            }

            switch(getDirection(elevator)) {
                case 'up':
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                    break;
                case 'down':
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                    break;
                case 'idle':
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(false);
            }
        };
        
        var queueIt = function(elevator, floorNum) {
            return;
            
            var found = false;
            for(var i=0; i<elevators.length; i++) {
                if(elevators[i].destinationQueue.indexOf(floorNum) !== -1) {
                    found = true;
                    break;
                }
            }
            if(found) {
                return;
            }
            
            elevator.goToFloor(floorNum);
            
            if(elevator.destinationQueue.length === 1) {
                return;
            }

            var higher = elevator.destinationQueue.filter(function(num) { return num > elevator.currentFloor(); });
            var lower = elevator.destinationQueue.filter(function(num) { return num <= elevator.currentFloor(); });
            higher.sort();
            lower.sort();
            lower.reverse();

            elevator.destinationQueue = (getDirection(elevator) === 'up') ? higher.concat(lower) : lower.concat(higher);

//                elevator.checkDestinationQueue();
        };
        
        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                elevator.goToFloor(0);
            });
            elevator.on('floor_button_pressed', function(floorNum) {
                // queueIt(elevator, floorNum);
                elevator.goToFloor(floorNum);
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                //setDirectionIndicators(elevator);
            });
            elevator.on("stopped_at_floor", function(floorNum) {
//                elevator.checkDestinationQueue();
                setDirectionIndicators(elevator);
            });
        });
        
        floors.forEach(function(floor) {
            var handleFloorButtonPress = function(direction) {
                var found = false;
                for(var i=0; i<elevators.length; i++) {
                    if(elevators[i].destinationQueue.indexOf(floor.floorNum()) !== -1) {
                        found = true;
                        break;
                    }
                }
                if(found) {
                    return;
                }
                
                var selectedElevator = null;
                
                elevators.forEach(function(elevator) {
                    if(elevator.destinationQueue.length === 0 || (elevator.loadFactor < 0.7 && isPassing(elevator, floor.floorNum(), direction))) {
                        selectedElevator = elevator;
                    }
                });
                
                if(!selectedElevator) {
                    elevators.forEach(function(elevator) {
                        if(elevator.loadFactor < 0.7 && isHeadingThatWay(elevator, floor.floorNum(), direction)) {
                            selectedElevator = elevator;
                        }
                    });
                }
                
                if(!selectedElevator) {
                    elevators.forEach(function(elevator) {
                        if(isHeadingThatWay(elevator, floor.floorNum(), direction)) {
                            selectedElevator = elevator;
                        }
                    });
                }
                
                if(!selectedElevator) {
                    elevators.forEach(function(elevator) {
                        if(elevator.loadFactor < 0.7) {
                            selectedElevator = elevator;
                        }
                    });
                }
                
                if(!selectedElevator) {
                    selectedElevator = elevators[0];
                }
                
                selectedElevator.goToFloor(floor.floorNum());
                
                //queueIt(selectedElevator, floor.floorNum());
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
