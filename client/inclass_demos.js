// LAMDA AND REDUCE EXAMPLE
let standardForm = [5,7,13,4].reduce(function(accumulator, element) {
    return accumulator + element;    
});

let lamdaForm = [5,7,13,4].reduce((accumulator, element) => accumulator + element);

console.log(`standardForm ${standardForm}   lamdaForm ${lamdaForm}`);

// Second parameter for reduce is the starting value for the accumulator
let startingAcc = [5,7,13,4].reduce((accumulator, element) => accumulator + element, 100); // starts accumulator at 100

console.log(`startingAcc ${startingAcc}`);