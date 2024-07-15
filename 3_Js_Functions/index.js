// Q1. Explain what is prototype and what is prototype chain in your own words.
/* Answer -> 
Every object has a special property called __proto__ (or [[Prototype]]), which is a reference to another object. 
This other object is known as the prototype. Prototypes allow objects to inherit properties and methods from other objects.
It makes it possible to define methods and properties that can be shared across all instances of a particular constructor function.

When an object tries to access a property or method, JavaScript (JS) first looks for it on the object itself. 
If it is not found, JS then looks at the object's prototype. If the property or method is still not found, 
JS continues to follow the __proto__ chain (the prototype chain) up to the prototype of the prototype, and so on, 
until it either finds the property/method or reaches the end of the chain where the prototype is null. Example - 
*/
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() { // Defining method in prototype that will be shared to all instances
  console.log('Hello, my name is ' + this.name);
};
const samkit = new Person('Samkit') // object samkit will have sayHello as an inherited function in its prototype
console.log(samkit);
samkit.sayHello(); // Output : Hello, my name is Samkit

// Q2. Implement your versions of the following Array methods (choose 6).
// map, filter, reduce, every, find, includes, join, pop, push, reverse, slice, sort

arr = [2,8,9,4,5,1]

// 1. Map -----------------------------------------------------------------------
console.log("1. Map function => ")
console.log("map function   - "+ arr.map((x)=>{return x*x}))
Array.prototype.myMap = function (cb, ...args) {
    let res = []
    for (let i=0; i<this.length; i++) {
        res.push(cb(this[i], i, this));
    };
    return res;
}
console.log("myMap function - "+ arr.myMap((x)=>{return x*x}))

// 2. Reduce --------------------------------------------------------------------
console.log("2. Reduce function => ")
console.log("reduce function   - "+ arr.reduce((x,y)=>{return x*y}))
Array.prototype.myReduce = function (cb, initVal) {
    let res = initVal !== undefined ? initVal : this[0];
    const start = initVal !== undefined ? 0 : 1;
    for (let i=start; i<this.length; i++) {
        res = cb(res, this[i], i, this);
    };
    return res
}
console.log("myReduce function - "+ arr.myReduce((x,y)=>{return x*y}));

// 3. Find ----------------------------------------------------------------------
console.log("3. Find function => ")
console.log("find function   - "+ arr.find((ele) => {return ele>=7}));
Array.prototype.myFind = function (cb, ...args) {
    let res;
    for (let i=0; i<this.length; i++) {
        if(cb(this[i], i, this)){
            res = this[i];
            break;
        }
    };
    return res;
}
console.log("myFind function - "+ arr.myFind((ele) => {return ele>=7}));

// 4. Join ----------------------------------------------------------------------
console.log("4. Join function => ")
console.log("join function   - "+ arr.join('-'));
Array.prototype.myJoin = function (sep, ...args) {
    if (this.length===1){
        return this[0];
    }
    let res=this[0];
    for (let i=1; i<this.length; i++) {
        res += sep+this[i]
    }
    return res;
}
console.log("myJoin function - "+ arr.myJoin('-'));

// 5. Push ----------------------------------------------------------------------
console.log("5. Push function => ")
arr.push(24)
console.log("push function (arr.push(24))    - "+ arr);
Array.prototype.myPush = function (...args) {
    for (let i = 0; i < args.length; i++) {
        this[this.length] = args[i]
    }
    return this.length;
}
arr.myPush(25) 
console.log("myPush function (arr.myPush(25))- "+ arr);

// 6. Pop -----------------------------------------------------------------------
console.log("6. Push function => ")
console.log("popped item - "+ arr.pop() +" | pop function (arr.pop())  - "+ arr);
Array.prototype.myPop = function () {
    if(this.length===0) return;
    let res = this[this.length-1];
    delete this[this.length-1];
    this.length--;
    return res;
}
console.log("popped item - "+ arr.myPop() +" | myPop function (arr.pop())- "+ arr);
// ------------------------------------------------------------------------------