let threadId = -1;
let inputData;
let population;
let populationSize;
let elite;
let eliteSize;
let numberOfTasks;
let numberOfProcess;
let maxTimeOfProcess;
let mutationProbability;
let crossedElements;
let nextGeneration;
let bestTime = 0;
let worstTime = 0;
let optimization = 0;
let progressbar;
let generation = 0;
let generationSize;

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

function stop() {
    clearInterval(threadId);
}

function main() {
    $('#generation').text(generation++);
    crossedElements = crossingEliteElements(elite);
    nextGeneration = getEliteFromPopulation(crossedElements, eliteSize);
    let tmpTime = bestTimeOnProcessor(nextGeneration);

    if (generation == 1) $('#worstTime').text(worstTime + ' sek.');

    if (bestTime > tmpTime) {
        bestTime = tmpTime;
        optimization = worstTime - bestTime;
        progressbar = ((bestTime * 100) / worstTime).toFixed(2);
        progressbar = 100 - parseInt(progressbar);

        $('#bestTime').text(bestTime + ' sek.');
        $('#optimization').text(optimization + ' sek.');
        $('#progressBar').text(progressbar + '%');
        $('#progressBar').css('width', progressbar + '%');
    } else if (worstTime < tmpTime) {
        worstTime = tmpTime;
        optimization = worstTime - bestTime;
        progressbar = ((bestTime * 100) / worstTime).toFixed(2);
        progressbar = 100 - parseInt(progressbar);

        $('#worstTime').text(worstTime + ' sek.');
        $('#optimization').text(optimization + ' sek.');
        $('#progressBar').text(progressbar + '%');
        $('#progressBar').css('width', progressbar + '%');
    }
}

function start() {
    numberOfTasks = $('#numberOfTasks').val();
    numberOfProcess = $('#numberOfProcessors').val();
    maxTimeOfProcess = $('#maxTimeOfProcess').val();
    populationSize = $('#populationSize').val();
    eliteSize = $('#eliteSize').val();
    mutationProbability = $('#mutationProbability').val();
    generationSize = $('#generationSize').val();
    generation = 0;

    $('#generation').text('0');
    $('#bestTime').text('0 sek.');
    $('#worstTime').text('0 sek.');
    $('#optimization').text('0 sek.');
    $('#progressBar').text('0%');
    $('#progressBar').css('width', '0%');

    inputData = generateInputData(numberOfTasks, numberOfProcess);

    population = assignRandomTasksToProcessors(populationSize);
    elite = getEliteFromPopulation(population, eliteSize);

    bestTime = bestTimeOnProcessor(elite);
    worstTime = bestTimeOnProcessor(elite);

    if (threadId != -1) {
        stop();
    }

    threadId = setInterval("main()", 0);
}
