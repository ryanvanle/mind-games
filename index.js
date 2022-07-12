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


    let calculationSelectors = qsa("#calculations-rules p");

    for (let i = 0; i < calculationSelectors.length; i++) {
      calculationSelectors[i].addEventListener("click", calculationRulesSelector);
    }

    console.log(calculationSelectors);
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
    let operationsAmount;

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

    // operationsAmount
    let operationsAmountSelector = qsa("#operations-amount p");
    console.log(operationsAmountSelector);
    for (let i = 0; i < operationsAmountSelector.length; i++) {
      if (operationsAmountSelector[i].classList.contains("selected")) {
        operationsAmount = operationsAmountSelector[i].textContent;
      } else if (operationsAmount !== undefined && operationsAmountSelector[i].classList.contains("selected")) {
        console.error("Multiple inputs selected");
      }
    }



    //check
    console.log(totalQuestions);
    console.log(inputType);
    console.log(operationsType);
    console.log(operationsAmount);

    if (totalQuestions >= 0 && totalQuestions <= 100) {
      // call need only this much questions function
    }

    if (totalQuestions === "" || inputType === undefined || inputType === null
    || operationsType.length === 0 || operationsAmount === undefined || operationsAmount === null) {
      console.log("works");
      // call error
    } else {
      id("calculations-menu").classList.add("hidden");
      id("calculations-game").classList.remove("hidden");
    }
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


  function startCalculations(totalQuestions, inputType, operationsType, operationAmount) {

    // general rules to keep track of
    // - amount of questions
    // - input type
    // - operations
    // Maximum amount of Operations




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