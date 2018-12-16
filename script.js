$(document).ready(function () {
    const populationSize = 90; //number of population
    const eliteSize = 10;       //number of elite
    const mutationProbability = 0.1;  //probability of mutation during reproduction
    const maxTimeOfProcess = 100;
    let generation = 0;

    let inputDataa = {
        numberOfTasks: 8,       //number of task
        numberOfProcess: 3,     //number of processor
        tasks: {
            0: {
                numberTask: 1,
                timeOnProcessor0: 10,
                timeOnProcessor1: 5,
                timeOnProcessor2: 22
            },
            1: {
                numberTask: 2,
                timeOnProcessor0: 5,
                timeOnProcessor1: 4,
                timeOnProcessor2: 3
            },
            2: {
                numberTask: 3,
                timeOnProcessor0: 20,
                timeOnProcessor1: 25,
                timeOnProcessor2: 23
            },
            3: {
                numberTask: 4,
                timeOnProcessor0: 8,
                timeOnProcessor1: 5,
                timeOnProcessor2: 9
            },
            4: {
                numberTask: 5,
                timeOnProcessor0: 2,
                timeOnProcessor1: 3,
                timeOnProcessor2: 4
            },
            5: {
                numberTask: 6,
                timeOnProcessor0: 34,
                timeOnProcessor1: 23,
                timeOnProcessor2: 12
            },
            6: {
                numberTask: 7,
                timeOnProcessor0: 5,
                timeOnProcessor1: 3,
                timeOnProcessor2: 3
            },
            7: {
                numberTask: 8,
                timeOnProcessor0: 22,
                timeOnProcessor1: 20,
                timeOnProcessor2: 33
            },
        }
    };
    let inputData = generateInputData(100, 10);

    $('#numberOfTasks').text(inputData.numberOfTasks);
    $('#numberOfProcess').text(inputData.numberOfProcess);

    function assignRandomTasksToProcessors(populationSize = null) {
        let result = [];

        for (let i = 0; i < populationSize; i++) {
            let processorTasks = createTaskAllocationArray();

            for (let key in inputData.tasks) {
                let randomProcessor = Math.floor((Math.random() * Object.getOwnPropertyNames(processorTasks).length));
                processorTasks[randomProcessor].push(inputData.tasks[key]);
            }
            result.push(processorTasks);
        }

        return result;
    }

    function getEliteFromPopulation(population, eliteSize = null) {
        let elite = [];

        for (let currentPopulation = 0; currentPopulation < populationSize; currentPopulation++) {
            if (currentPopulation < eliteSize) {
                elite.push(population[currentPopulation]);
            } else {
                elite.forEach(function (el, i, arr) {
                    if (timeOnProcessor(population[currentPopulation]) < timeOnProcessor(el)) {
                        arr.splice(i, 1);
                        arr.push(population[currentPopulation]);
                    }
                });
            }
        }

        return elite;
    }

    function timeOnProcessor(currentPopulation = null) {
        let time = [];

        for (let currentProcessor = 0; currentProcessor < inputData.numberOfProcess; currentProcessor++) {
            time[currentProcessor] = 0;
            for (let task in currentPopulation[currentProcessor]) {
                time[currentProcessor] += currentPopulation[currentProcessor][task]['timeOnProcessor' + currentProcessor];
            }
        }

        return time.reduce((a, b) => a + b);
    }

    function bestTimeOnProcessor(elite) {
        let bestTime = timeOnProcessor(elite['0']);

        for (let i = 0; i < eliteSize; i++) {
            if (timeOnProcessor(elite[i]) < bestTime) {
                bestTime = timeOnProcessor(elite[i]);
            }
        }

        return bestTime;
    }

    function crossingEliteElements(elite = null) {
        let nextPopulation = [];

        for (let currentElement = 0; currentElement < elite.length; currentElement++) {
            for (let nextElement = 0; nextElement < elite.length; nextElement++) {
                if (currentElement !== nextElement) {
                    nextPopulation.push(reproduction(elite[currentElement], elite[nextElement]));
                }
            }
        }

        return nextPopulation;
    }

    function createTaskAllocationArray() {
        let array = {};

        for (let i = 0; i < inputData.numberOfProcess; i++) {
            array[i] = [];
        }

        return array;
    }

    function reproduction(mother = null, father = null) {
        let child = createTaskAllocationArray();

        for (let i = 1; i <= inputData.numberOfTasks; i++) {
            if (Math.random() < 0.5) {
                let task = findTaskByNumberTask(mother, i);
                let processorMutation = mutation(task.currentProcessor);
                child[processorMutation].push(mother[task.currentProcessor][task.currentTask]);
            } else {
                let task = findTaskByNumberTask(father, i);
                let processorMutation = mutation(task.currentProcessor);
                child[processorMutation].push(father[task.currentProcessor][task.currentTask]);
            }
        }

        return child;
    }

    function findTaskByNumberTask(parent, i) {
        for (let currentProcessor = 0; currentProcessor < inputData.numberOfProcess; currentProcessor++) {
            for (let currentTask in parent[currentProcessor]) {
                if (parent[currentProcessor][currentTask]['numberTask'] === i) {
                    return {
                        currentProcessor: currentProcessor,
                        currentTask: parseInt(currentTask)
                    };
                }
            }
        }
    }

    function mutation(currentProcessor) {
        let processor;

        if (Math.random() < mutationProbability) {
            processor = Math.floor(Math.random() * inputData.numberOfProcess);
        } else {
            processor = currentProcessor;
        }

        return processor;
    }

    function generateInputData(numberOfTasks = null, numberOfProcess = null) {
        let initialData = {
            numberOfTasks: numberOfTasks,
            numberOfProcess: numberOfProcess,
            tasks: []
        };

        for (let i = 1; i <= numberOfTasks; i++) {
            let tasks = {};
            tasks = Object.assign({}, {numberTask: i});

            for (let j = 0; j < numberOfProcess; j++) {
                tasks = Object.assign(tasks, {['timeOnProcessor' + j]: Math.floor(Math.random() * maxTimeOfProcess)});
            }

            initialData.tasks.push(tasks);
        }

        return initialData;
    }

    let population = assignRandomTasksToProcessors(populationSize);
    let elite = getEliteFromPopulation(population, eliteSize);

    for (generation; generation < 1000; generation++) {
        let crossedElements = crossingEliteElements(elite);
        let nextGeneration = getEliteFromPopulation(crossedElements, eliteSize);
        console.log('Najlepszy czas na procesorze: ' + bestTimeOnProcessor(nextGeneration) + ' sek.');
    }
});
