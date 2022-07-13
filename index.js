"use strict";

(function() {
  // MODULE GLOBAL VARIABLES, CONSTANTS, AND HELPER FUNCTIONS CAN BE PLACED HERE

  /**
  * Add a function that will be called when the window is loaded.
  */
  window.addEventListener("load", init);

  /**
  * CHANGE: Describe what your init function does here.
  */
  function init() {
    // THIS IS THE CODE THAT WILL BE EXECUTED ONCE THE WEBPAGE LOADS

    id("calculation-button").addEventListener("click", menuToCalculation);
    qs(".back-button").addEventListener("click", backToMenu);
    qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);

    // let canvas = new handwriting.Canvas(id("can"));


    let calculationSelectors = qsa("#calculations-rules p");

    for (let i = 0; i < calculationSelectors.length; i++) {
      calculationSelectors[i].addEventListener("click", calculationRulesSelector);
    }

  }

  function menuToCalculation() {
    id("main-menu").classList.add("hidden");
    id("calculations-menu").classList.remove("hidden");
  }

  function backToMenu() {
    id("main-menu").classList.remove("hidden");
    id("calculations-menu").classList.add("hidden");
  }

  function calculationRulesToGame() {

    // need to check if everything is filled out properly

    let totalQuestions = qs("#amount").value;
    let inputType;
    let operationsType = [];
    let termAmount;
    const MAXIMUM_QUESTIONS = 100;

    // you could make this into multiple functions of anonymous functions when doing the variable
    // initialization and return it but i feel like it would be confusing to read personally but
    // it is subjective.

    // inputType
    let inputs = qsa("#input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }

    // operationsType
    let operationsOptions = qsa("#operations-type p");
    for (let i = 0; i < operationsOptions.length; i++) {
      if (operationsOptions[i].classList.contains("selected")) {
        operationsType.push(operationsOptions[i].textContent);
      }
    }

    // termAmount
    let termAmountSelector = qsa("#operations-amount p");
    console.log(termAmountSelector);
    for (let i = 0; i < termAmountSelector.length; i++) {
      if (termAmountSelector[i].classList.contains("selected")) {
        termAmount = termAmountSelector[i].textContent;
      } else if (termAmount !== undefined && termAmountSelector[i].classList.contains("selected")) {
        console.error("Multiple inputs selected");
      }
    }

    // general check to see if all fields are filled out
    if (totalQuestions === "" || inputType === undefined || inputType === null
    || operationsType.length === 0 || termAmount === undefined || termAmount === null) {
      qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
      id("calculations-rules").classList.add("hidden");
      id("missing-error").classList.remove("hidden");
      setTimeout(() => {
        id("calculations-rules").classList.remove("hidden");
        id("missing-error").classList.add("hidden");
        qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
      }, 1000);

    // check if the question is within the limit
    } else if (Number(totalQuestions) < 0 || Number(totalQuestions) > MAXIMUM_QUESTIONS) {
      qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
      id("calculations-rules").classList.add("hidden");
      id("amount-error").classList.remove("hidden");
      setTimeout(() => {
        id("calculations-rules").classList.remove("hidden");
        id("amount-error").classList.add("hidden");
        qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
      }, 1000);

    // start
    } else {
      id("calculations-menu").classList.add("hidden");
      id("calculations-game").classList.remove("hidden");
      let converted = convertTextToSymbol(operationsType);
      startCalculations(totalQuestions, inputType, converted, termAmount);
    }
  }

  function convertTextToSymbol(operationType) {
    let converted = [];

    for (let i = 0; i < operationType.length; i++) {
      if (operationType[i] === "Addition") converted.push("+");
      if (operationType[i] === "Subtraction") converted.push("-");
      if (operationType[i] === "Multiplication") converted.push("*");
      if (operationType[i] === "Division") converted.push("/");
    }

    return converted;

  }
  function calculationRulesSelector() {
    if (this.parentNode.id === "input-type") {
      let buttons = qsa("#input-type p");
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== this) {
          buttons[i].classList.remove("selected");
        } else {
          this.classList.toggle("selected");
        }
      }
    } else if (this.parentNode.id === "operations-amount") {
      let buttons = qsa("#operations-amount p");
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== this) {
          buttons[i].classList.remove("selected");
        } else {
          this.classList.toggle("selected");
        }
      }
     } else {
      this.classList.toggle("selected");
     }
  }


  function startCalculations(totalQuestions, inputType, operationsType, termAmount) {

    // general rules to keep track of
    // - amount of questions
    // - input type
    // - operations
    // Maximum amount of Operations

    generateQuestions(totalQuestions, operationsType, termAmount);


    let can = new handwriting.Canvas(id("can"));

    can.setCallBack(function(data, err) {
      if (err) {
        console.log("no data available");
      } else {
        console.log(data); // change here for correct answer check
      }
    });

    can.setOptions(
      {
        language: "en",
        numOfReturn: 5
      }
    );

    setInterval(() => {
      can.recognize();
    }, 500);

    qs("#user-section button").addEventListener("click", () => {
      can.erase();
    });




  }

  function generateQuestions(totalQuestions, operationsType, termAmount) {


    const MAXIMUM_NUMBER = 21;

    let termOne = [];
    let termTwo = [];
    let termThree = [];
    let termFour = [];
    let operationOne = [];
    let operationTwo = [];
    let operationThree = [];

    for (let i = 0; i < totalQuestions; i++) {
      termOne.push(getRandomInt(MAXIMUM_NUMBER));
      termTwo.push(getRandomInt(MAXIMUM_NUMBER));
      termThree.push(getRandomInt(MAXIMUM_NUMBER));
      termFour.push(getRandomInt(MAXIMUM_NUMBER));
      operationOne.push(operationsType[getRandomInt(operationsType.length)]);
      operationTwo.push(operationsType[getRandomInt(operationsType.length)]);
      operationThree.push(operationsType[getRandomInt(operationsType.length)]);
    }

    console.log(math.evaluate("2+2"));

    // console.log(termOne);
    // console.log(termTwo);
    // console.log(termThree);
    // console.log(termFour);
    // console.log(operationOne);
    // console.log(operationTwo);
    // console.log(operationThree);






    // 5 + 2
    // 5 + 3
    // 7 + 12 - 5
    // 7 / 2 - 2
    // 8 - 2 * 4




  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  /**
  * Make sure to always add a descriptive comment above
  * every function detailing what it's purpose is
  * Use JSDoc format with @param and @return.
  */
  function exampleFunction1() {
    /* SOME CODE */
  }

  /**
  * Make sure to always add a descriptive comment above
  * every function detailing what it's purpose is
  * @param {variabletype} someVariable This is a description of someVariable, including, perhaps, preconditions.
  * @returns {returntype} A description of what this function is actually returning
  */
  function exampleFunction2(someVariable) {
    /* SOME CODE */
    return something;
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
  * Note: You may use these in your code, but remember that your code should not have
  * unused functions. Remove this comment in your own code.
  */

  /**
  * Returns the element that has the ID attribute with the specified value.
  * @param {string} idName - element ID
  * @returns {object} DOM object associated with id.
  */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
  * Returns the first element that matches the given CSS selector.
  * @param {string} selector - CSS query selector.
  * @returns {object} The first DOM object matching the query.
  */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
  * Returns the array of elements that match the given CSS selector.
  * @param {string} selector - CSS query selector
  * @returns {object[]} array of DOM objects matching the query.
  */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
  * Returns a new element with the given tag name.
  * @param {string} tagName - HTML tag name for new DOM element.
  * @returns {object} New DOM object for given HTML tag.
  */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();