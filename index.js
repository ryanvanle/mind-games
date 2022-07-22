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
    id("calculation-button").addEventListener("click", menuToCalculation);
    qs(".back-button").addEventListener("click", backToMenu);
    qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);

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
    let totalQuestions = qs("#amount").value;
    let inputType = calculationsInputCheck();
    let operationsType = calculationsOperationsType();
    let termAmount = calculationsTermAmount();
    const MAXIMUM_QUESTIONS = 100;

    // general check to see if all fields are filled out
    let filledOutCheck = totalQuestions === "" || inputType === undefined || inputType === null
    || operationsType.length === 0 || termAmount === undefined || termAmount === null;

    // check if the question is within the limit
    let totalQuestionsCheck = Number(totalQuestions) < 0
    || Number(totalQuestions) > MAXIMUM_QUESTIONS;

    if (filledOutCheck) {
      qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
      id("calculations-rules").classList.add("hidden");
      id("missing-error").classList.remove("hidden");
      setTimeout(() => {
        id("calculations-rules").classList.remove("hidden");
        id("missing-error").classList.add("hidden");
        qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
      }, 1000);
    } else if (totalQuestionsCheck) {
      qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
      id("calculations-rules").classList.add("hidden");
      id("amount-error").classList.remove("hidden");
      setTimeout(() => {
        id("calculations-rules").classList.remove("hidden");
        id("amount-error").classList.add("hidden");
        qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
      }, 1000);
    } else {
      id("calculations-menu").classList.add("hidden");
      id("calculations-game").classList.remove("hidden");
      let converted = convertTextToSymbol(operationsType);
      startCalculations(totalQuestions, inputType, converted, termAmount);
    }
  }

  function calculationsInputCheck() {
    let inputType;
    let inputs = qsa("#input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  function calculationsOperationsType() {
    let operationsType = [];
    let operationsOptions = qsa("#operations-type p");
    for (let i = 0; i < operationsOptions.length; i++) {
      if (operationsOptions[i].classList.contains("selected")) {
        operationsType.push(operationsOptions[i].textContent);
      }
    }
    return operationsType;
  }

  function calculationsTermAmount() {
    let termAmount;
    let termAmountSelector = qsa("#operations-amount p");
    for (let i = 0; i < termAmountSelector.length; i++) {
      if (termAmountSelector[i].classList.contains("selected")) {
        termAmount = termAmountSelector[i].textContent;
      } else if (termAmount !== undefined && termAmountSelector[i].classList.contains("selected")) {
        console.error("Multiple inputs selected");
      }
    }
    return termAmount;
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

    let questions = generateQuestions(totalQuestions, operationsType, termAmount);
    let currentScore = 0;
    let parentElement = id("user-section");

    displayEquations(questions, currentScore);

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      let can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        checkAnswer(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      id("can").addEventListener("click", () => {
        can.recognize();
      })

      qs("#user-section button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestion();
      });

    } else {
      let inputElement = gen("input");
      inputElement.type = "number";
      inputElement.id = "type-input";
      inputElement.name = "type-input";
      parentElement.prepend(inputElement);

      id("type-input").addEventListener("keyup", () => {
        let inputElementData = id("type-input").value;
        if (inputElementData !== "") {
          checkAnswer([inputElementData], null);
        } else {
          clearCurrentQuestion();
        }
      })

      qsa("#user-section button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestion();
      });
    }
  }

  function clearCurrentQuestion() {
    let currentQuestion = qs("#current-question h4");
    let currentQuestionText = currentQuestion.textContent.match(/^[^=]*/)[0];
    currentQuestion.textContent = currentQuestionText + "=";
  }

  function checkAnswer(data, can) {

    if (data == null) { //undefined and null
      return;
    }

    let parsedData = []; // only numbers
    let currentQuestion = qs("#current-question h4");

    //Gets rid of the "="
    let currentQuestionText = currentQuestion.textContent.match(/^[^=]*/)[0];
    let answer = math.evaluate(currentQuestionText);

    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        parsedData.push(data[i]);
      }
    }

    if (Number(parsedData[0]) === Number(answer) && parsedData.length > 0) {
      currentQuestion.textContent = currentQuestionText + "=" + parsedData[0];

      if (can != null) {
        can.erase();
      } else {
        id("type-input").value = "";
      }

      nextQuestion();
    } else if (parsedData.length > 0) {
      let newText = currentQuestionText + "=" + parsedData[0];
      currentQuestion.textContent = newText;
    } else {
      currentQuestion.textContent = currentQuestionText + "=";
    }

  }


   function nextQuestion() {

    id("score").textContent = Number(id("score").textContent) + 1;

    let startSpace = qs("#questions div");
    if (startSpace.id === "start-space-0") {
      qs("#questions div").id = "start-space-1";
      let newCurrentQuestion = id("current-question").nextElementSibling;
      id("current-question").id = "";
      newCurrentQuestion.id = "current-question";

    } else if (startSpace.id === "start-space-1") {
      qs("#questions div").id = "start-space-2";
      let newCurrentQuestion = id("current-question").nextElementSibling;
      id("current-question").id = "";
      newCurrentQuestion.id = "current-question";
    } else {
      let newCurrentQuestion = id("current-question").nextElementSibling;
      id("current-question").id = "";
      newCurrentQuestion.id = "current-question";

      moveQuestion();
      setTimeout(() => {

        let currentQuestion = id("current-question");
        let questions = currentQuestion.parentNode;
        let index = Array.prototype.indexOf.call(questions.children, currentQuestion);

        if (index >= 4) {
          moveQuestion();
        }

      }, 750);
      addQuestion();
    }

  }

  function addQuestion() {

    // add it to the end of the display, check the rules to see
  }

  function moveQuestion() {
    let questions = qsa("#questions div");
    let transitionElement = qs("#questions div");
    transitionElement.id = "start-space-removed-transition";
    let topQuestion = questions[1];
    setTimeout(() => {
      transitionElement.style.transition = "0s";
      topQuestion.remove();
      transitionElement.id = "start-space-2";
    }, 500);
    transitionElement.style.transition = "0.5s";
  }

  function generateQuestions(totalQuestions, operationsType, termAmount) {

    const MAXIMUM_NUMBER = 13; // TODO: need to make this an option for the user to pick

    let equations = [];
    while (equations.length < totalQuestions) {
      let termOne = getRandomInt(MAXIMUM_NUMBER);
      let termTwo = getRandomInt(MAXIMUM_NUMBER);
      let termThree = getRandomInt(MAXIMUM_NUMBER);
      let termFour = getRandomInt(MAXIMUM_NUMBER);
      let operationOne = operationsType[getRandomInt(operationsType.length)];
      let operationTwo = operationsType[getRandomInt(operationsType.length)];
      let operationThree = operationsType[getRandomInt(operationsType.length)];

      let amountOfTerms = getRandomIntBetween(2, Number(termAmount) + 1);
      let currentEquation = termOne + operationOne + termTwo;

      if (amountOfTerms === 3) {
        currentEquation = termOne + operationOne + termTwo + operationTwo + termThree;
        if (currentEquation.includes("*") || currentEquation.includes("/")) {
          let zeroOrOne = getRandomInt(2);
          if (zeroOrOne === 0) {
            currentEquation = "(" + termOne + operationOne + termTwo + ")" + operationTwo + termThree;
          } else {
            currentEquation = termOne + operationOne + "(" + termTwo + operationTwo + termThree + ")";
          }
        }
      }

      if (amountOfTerms === 4) {
        currentEquation = "(" + termOne + operationOne + termTwo + ")"
        + operationTwo + "(" + termThree + operationThree + termFour + ")";
      }

      let result = math.evaluate(currentEquation);


      //forces only whole and actual answers to be in the question pool
      if (result !== Infinity && result % 1 === 0) {
        equations.push(currentEquation);
      }
    }

    return equations;
  }

  // function generateAnswers(equations) {
  //   let answers = [];
  //   for (let i = 0; i < equations.length; i++) {
  //     answers.push(math.evaluate(equations[i]));
  //   }
  //   return answers;
  // }

  function displayEquations(equations, currentScore) {
    let displayedQuestions = 10;
    let questionBox = qs("#questions");

    if (equations.length <= displayedQuestions) {
      displayedQuestions = equations.length;
    }

    for (let i = currentScore; i < displayedQuestions + currentScore; i++) {
      let currentEquation = gen("div");
      let h4 = gen("h4");
      currentEquation.appendChild(h4);
      currentEquation.classList.add("equation");

      if (i === currentScore) {
        currentEquation.id = "current-question";
      }

      h4.textContent = equations[i] + "=";
      questionBox.appendChild(currentEquation);
    }

  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
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


/* TODO: in order
  - css polishing
  - check mark
- finish skip
- end game
  - add stopwatch timer
  - clear timers and such
  - highscore
- general polishing
  - css resizing, constants = bad it seems
  - local storage of settings
*/