"use strict";

(function() {
  /**
  * Add a function that will be called when the window is loaded.
  */
  window.addEventListener("load", init);
  let totalQuestionsCounter = 0;
  let can;

  let setIntervalTimerIDs = [];
  let totalRoundCounter;
  let countingAnswerDiv;
  let countingAnswer;
  const COLORS = ["red", "blue", "green", "black", "purple", "pink", "orange"];
  const ANIMATIONS = ["growing", "spinning", "moving"];

  let peopleInHouse = 0;
  let totalRoundCounterHousing;

  /**
  * Adds all the clickable buttons throughout the application excluding the user's input for games.
  */
  function init() {

    if (window.localStorage.getItem("calculationsRules") != null) previousCalculationsRulesSetup();
    if (window.localStorage.getItem("countingRules") != null) previousCountingRulesSetup();
    if (window.localStorage.getItem("housingRules") != null) previousHousingRulesSetup();

    id("counting-button").addEventListener("click", menuToCounting);
    id("housing-button").addEventListener("click", menuToHousing);
    id("calculation-button").addEventListener("click", menuToCalculation);

    qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);

    qs("#results button").addEventListener("click", calculationsResultsToMenu);
    qs("#counting-results button").addEventListener("click", countingResultsToMenu);
    qs("#housing-results button").addEventListener("click", housingResultsToMenu);

    let backButtons = qsa(".back-button");
    for (let i = 0; i < backButtons.length; i++) {
      backButtons[i].addEventListener("click", backToMenu);
    }

    let calculationSelectors = qsa("#calculations-rules p");
    for (let i = 0; i < calculationSelectors.length; i++) {
      calculationSelectors[i].addEventListener("click", calculationRulesSelector);
    }

    let countingSelectors = qsa("#counting-rules p");
    for (let i = 0; i < countingSelectors.length; i++) {
      countingSelectors[i].addEventListener("click", countingRulesSelector);
    }

    let housingSelectors = qsa("#housing-rules p");
    for (let i = 0; i < housingSelectors.length; i++) {
      housingSelectors[i].addEventListener("click", housingRulesSelector);
    }

  }

  /**
   * Switches main menu to Counting game menu.
   */
  function menuToCounting() {
    id("main-menu").classList.add("hidden");
    id("counting-menu").classList.remove("hidden");
  }

  /**
   * Switches main menu to Housing game menu.
   */
  function menuToHousing() {
    id("main-menu").classList.add("hidden");
    id("housing-menu").classList.remove("hidden");
  }

  /**
   * Switches from main menu to Calculation game menu.
   */
  function menuToCalculation() {
    id("main-menu").classList.add("hidden");
    id("calculations-menu").classList.remove("hidden");
  }

  /**
   * Switches from Housing results to main menu.
   */
  function housingResultsToMenu() {
    id("housing-results").classList.add("hidden");
    id("main-menu").classList.remove("hidden");
  }

  /**
   * Switches from rules menu to main menu.
   */
  function backToMenu() {
    id("main-menu").classList.remove("hidden");
    id("calculations-menu").classList.add("hidden");
    id("counting-menu").classList.add("hidden");
    id("housing-menu").classList.add("hidden");
  }

  /**
   * Checks the calculations rules are filled out properly, if not throw error screen, else
   * switch to the game and starts calculations.
   */
  function calculationRulesToGame() {
    let totalQuestions = qs("#amount").value;
    let maxNumber = qs("#max-number").value;
    let inputType = calculationsInputCheck();
    let operationsType = calculationsOperationsType();
    let termAmount = calculationsTermAmount();
    const MAXIMUM_QUESTIONS = 100;
    const MAXIMUM_NUMBER = 1000;

    // general check to see if all fields are filled out
    let filledOutCheck = totalQuestions === "" || inputType == null
    || operationsType.length === 0 || termAmount == null || maxNumber === "";

    // check if the question is within the limit
    let totalQuestionsCheck = Number(totalQuestions) < 0
    || Number(totalQuestions) > MAXIMUM_QUESTIONS;

    let maxNumberCheck = Number(maxNumber) < 0
    || Number(maxNumber) > MAXIMUM_NUMBER;

    if (filledOutCheck) {
      calculationsDisplayBlankValuesError();
    } else if (totalQuestionsCheck) {
      calculationsDisplayQuestionAmountError();
    } else if (maxNumberCheck) {
      calculationsMaxNumberError();
    } else {
      id("calculations-menu").classList.add("hidden");
      id("calculations-game").classList.remove("hidden");
      let converted = convertTextToSymbol(operationsType);
      setCalculationsRulesLocalStorage(totalQuestions, inputType, operationsType, termAmount, maxNumber);
      startCalculations(totalQuestions, inputType, converted, termAmount, maxNumber);
    }
  }

  /**
   * Displays that a rule is missing error to the user.
   */
  function calculationsDisplayBlankValuesError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("missing-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  /**
   * Display that the question amount is not filled out or an invalid value like -1.
   */
  function calculationsDisplayQuestionAmountError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("amount-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("amount-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  /**
   * Displays that the max number field is an invalid value, negative numbers.
   */
  function calculationsMaxNumberError() {
    qs("#calculations-buttons .start").removeEventListener("click", calculationRulesToGame);
    id("calculations-rules").classList.add("hidden");
    id("max-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("calculations-rules").classList.remove("hidden");
      id("max-number-error").classList.add("hidden");
      qs("#calculations-buttons .start").addEventListener("click", calculationRulesToGame);
    }, 1000);
  }

  /**
   * Gets the input rule value for calculations.
   * @returns {String} Calculations current input type (Write or Type)
   */
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

  /**
   * Gets the operations rule value for calculations.
   * @returns {String[]} Calculations' selected operation types
   * (Addition, Subtraction, Division, Multiplication).
   */
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

  /**
   * Gets the term amount rule value for calculations.
   * @returns {String} Number of maximum operations terms that a question has.
   */
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

  /**
   * Converts user's operations types from its English form to Symbol form.
   * @param {String[]} operationType - Word versions of the operation type selected by the user.
   * @returns {String[]} - Symbol version of the operation type selected by the user.
   */
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

  /**
   * Checks for the calculation's input rule and term amount rule that only one of the options is selected
   * and deselects the previous option.
   */
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

  /**
   * Sets the local storage of the calculations rules as an object so it can be updated on refresh
   * through previousCalculationsRulesSetup.
   * @param {String} totalQuestions - user's selected question amount.
   * @param {String} inputType - user's input method.
   * @param {String[]} operationsType - type of operations for the equations.
   * @param {String} termAmount - max amount of operations terms for the equations.
   * @param {String} maxNumber - max possible number each number in the equation can be.
   */
  function setCalculationsRulesLocalStorage(totalQuestions, inputType, operationsType, termAmount, maxNumber) {

    let rules = {
      "totalQuestions": totalQuestions,
      "inputType": inputType,
      "operationsType": operationsType,
      "termAmount": termAmount,
      "maxNumber": maxNumber
    }

    window.localStorage.setItem("calculationsRules", JSON.stringify(rules));
  }

  /**
   * Updates the calculations rules to its previous state through local storage.
   */
  function previousCalculationsRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("calculationsRules"));
    id("amount").value = rules["totalQuestions"];
    id("max-number").value = rules["maxNumber"];

    let inputsElement = qsa("#input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }

    let termAmountsElement = qsa("#operations-amount p");
    for (let i = 0; i < termAmountsElement.length; i++) {
      if (termAmountsElement[i].textContent === rules["termAmount"]) {
        termAmountsElement[i].classList.add("selected");
      }
    }

    let set = new Set();
    let operationsType = rules["operationsType"]
    let operationsTypeElements = qsa("#operations-type p");

    for (let i = 0; i < operationsType.length; i++) {
      set.add(operationsType[i]);
    }

    for (let i = 0; i < operationsTypeElements.length; i++) {
      if (set.has(operationsTypeElements[i].textContent)) operationsTypeElements[i].classList.add("selected");
    }
  }


  /**
   * Transitions from rules to game and sets up the game by activating the timer, user input, and
   * then display questions.
   * @param {String} totalQuestions - user's selected question amount.
   * @param {String} inputType - user's input method.
   * @param {String[]} operationsType - type of operations for the equations.
   * @param {String} termAmount - max amount of operations terms for the equations.
   * @param {String} maxNumber - max possible number each number in the equation can be.
   */
  function startCalculations(totalQuestions, inputType, operationsType, termAmount, maxNumber) {

    // general rules to keep track of
    // - amount of questions
    // - input type
    // - operations
    // Maximum amount of Operations

    start();

    let parentElement = id("user-section");
    let displayedQuestionAmount = 10;

    displayEquations(operationsType, termAmount, displayedQuestionAmount, maxNumber);

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        checkAnswer(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      // id("can").addEventListener("click", () => {
      //   can.recognize();
      // });

      ["click", "touchend"].forEach(function(e) {
        id("can").addEventListener(e,() => {
          can.recognize();
        });
      });

      qs("#user-section button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestion();
      });

      qsa("#user-section button")[1].addEventListener("click", () =>  {
        can.erase();
        skipQuestion();
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

      qsa("#user-section button")[0].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestion();
      });

      qsa("#user-section button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        skipQuestion();
      });

    }
  }

  /**
   * When the clear button is pressed, this updates the calculations text box to be blank.
   */
  function clearCurrentQuestion() {
    let currentQuestion = qs("#current-question h4");
    let currentQuestionText = currentQuestion.textContent.match(/^[^=]*/)[0];
    currentQuestion.textContent = currentQuestionText + "=";
  }

  /**
   * When the user updates their calculations user-input, this handles if the input is correct or not and updates accordingly.
   * @param {String[]} data - User's input, String[] is used due to the handwriting making a prediction of what the input means.
   * @param {Object} can - Canvas object where the user writes their input.
   */
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

      playCorrectAnswerSound();
      id("score").textContent = Number(id("score").textContent) + 1;
      appendCheckmark();
      nextQuestion();
    } else if (parsedData.length > 0) {
      let newText = currentQuestionText + "=" + parsedData[0];
      currentQuestion.textContent = newText;
    } else {
      currentQuestion.textContent = currentQuestionText + "=";
    }

  }

  /**
   * When an answer is skipped or answered, this shifts the user to the next question and appends
   * one question to the back of the queue. Controls the question animations as well.
   * Lastly if there is no more questions, then it wll trigger the endgame.
   */
  function nextQuestion() {

    if (id("current-question").nextElementSibling == null) {
      calculationsEndgame();
      return;
    }

    let startSpace = qs("#questions div");
    if (startSpace.id === "start-space-0") {
      qs("#questions div").id = "start-space-1";
      moveCurrentQuestion();
    } else if (startSpace.id === "start-space-1") {
      qs("#questions div").id = "start-space-2";
      moveCurrentQuestion();
    } else {
      moveCurrentQuestion();
      moveQuestionScroll();
      clearAllEventListeners(qsa("#user-section button")[1])
      setTimeout(() => {
        let currentQuestion = id("current-question");
        let questions = currentQuestion.parentNode;
        let index = Array.prototype.indexOf.call(questions.children, currentQuestion);

        if (index >= 4) {
          moveQuestionScroll();
        }

        let input = getInputType();

        if (input.id === "can") {
          qsa("#user-section button")[1].addEventListener("click", () => {
            can.erase();
            skipQuestion();
          });
        } else if (input.id === "type-input") {
          qsa("#user-section button")[1].addEventListener("click", () => {
            id("type-input").value = "";
            skipQuestion();
          });
        }

      }, 500);
      //displays the next question, if no more questions, endgame happens
      displayEquations(convertTextToSymbol(calculationsOperationsType()), calculationsTermAmount(), 1, calculationsMaxNumber());
    }

  }

  /**
   * Helper that returns the value of the calculations max number.
   * @returns {String} Calculations max number rule value.
   */
  function calculationsMaxNumber() {
    return id("max-number").value;
  }

  /**
   * Moves the currentQuestion class to the HTMLElement next after the current currentQuestion element.
   */
  function moveCurrentQuestion() {
    let oldCurrentQuestion = id("current-question");
    let newCurrentQuestion = oldCurrentQuestion.nextElementSibling;
    id("current-question").id = "";
    newCurrentQuestion.id = "current-question";
  }

  /**
   * When an answer is right, adds check mark over the equation.
   */
  function appendCheckmark() {
    let oldCurrentQuestion = id("current-question");
    let image = gen("img");
    image.src = "img/checkmark.png";
    image.alt = "green checkmark";
    image.classList.add("checkmark");
    oldCurrentQuestion.appendChild(image);
  }

  /**
   * When an answer is right, this sound plays.
   */
  function playCorrectAnswerSound() {
    let sound = new Audio("sound/correct.mp3");
    sound.play();
  }

  /**
   * When an answer is skipped or incorrect, this sound plays.
   */
  function playSkipSound() {
    let sound = new Audio("sound/incorrect.mp3");
    sound.play();
  }

  /**
   * When a game ends, this sound plays.
   */
  function playWinSound() {
    let sound = new Audio("sound/win-sound.mp3");
    sound.play();
  }

  /**
   * Generates valid questions and generate its String to be used when displayed.
   * @param {Number} totalQuestions - total amount of questions to be made.
   * @param {String[]} operationsType - type of operations for the equations.
   * @param {String} termAmount - max amount of operations terms for the equations.
   * @param {String} maxNumber - max possible number each number in the equation can be.
   * @returns {String[]} Generated questions.
   */
  function generateQuestions(totalQuestions, operationsType, termAmount, maxNumber) {

    let equations = [];
    while (equations.length < totalQuestions) {
      let termOne = getRandomInt(maxNumber);
      let termTwo = getRandomInt(maxNumber);
      let termThree = getRandomInt(maxNumber);
      let termFour = getRandomInt(maxNumber);
      let operationOne = operationsType[getRandomInt(operationsType.length-1)];
      let operationTwo = operationsType[getRandomInt(operationsType.length-1)];
      let operationThree = operationsType[getRandomInt(operationsType.length-1)];

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

  /**
   * Displays the randomly generated equations.
   * @param {String[]} operationsType - type of operations for the equations.
   * @param {String} termAmount - max amount of operations terms for the equations.
   * @param {String} questionAmount - amount of questions to be displayed
   * @param {String} maxNumber - max possible number each number in the equation can be.
   */
  function displayEquations(operationsType, termAmount, questionAmount, maxNumber) {
    if (totalQuestionsCounter === 0 && qs(".equation") == null) {
      totalQuestionsCounter = id("amount").value;
    } else if (totalQuestionsCounter === 0) {
      return; // stop generating questions
    }

    let displayedQuestions = questionAmount;
    if (questionAmount >= totalQuestionsCounter) {
      displayedQuestions = totalQuestionsCounter;
    }

    let equations = generateQuestions(displayedQuestions, operationsType, termAmount, maxNumber);
    let questionBox = qs("#questions");
    for (let i = 0; i < displayedQuestions; i++) {
      let currentEquation = gen("div");
      let h4 = gen("h4");
      currentEquation.appendChild(h4);
      currentEquation.classList.add("equation");

      // checks if there is no questions
      if (i === 0 && qs(".equation") == null) {
        currentEquation.id = "current-question";
      }

      h4.textContent = equations[i] + "=";
      questionBox.appendChild(currentEquation);
    }

    totalQuestionsCounter = totalQuestionsCounter - displayedQuestions;
  }

  /**
   * When the game ends due to finishing it, this function calls to transition the user and reset the game state.
   */
  function calculationsEndgame() {
    playWinSound();
    stop();
    updateStats();
    clearCalculationState();
    transitionToResults();
  }

  /**
   * Updates the current question and shifts it upwards while also removing the top non-visible question.
   */
  function moveQuestionScroll() {
    let questions = qsa("#questions div");
    let transitionElement = qs("#questions div");
    transitionElement.id = "start-space-removed-transition";
    let topQuestion = questions[1];
    setTimeout(() => {
      transitionElement.style.transition = "0s";
      topQuestion.remove();
      transitionElement.id = "start-space-2";
    }, 500);
    transitionElement.style.transition = "0.25s";
  }

  /**
   * Updates the calculation's results page with the stats from the calculations game.
   */
  function updateStats() {
    let questionAmount = id("amount").value;
    let inputType = calculationsInputCheck();
    let operationsType = calculationsOperationsType();
    let termAmount = calculationsTermAmount();
    let maxNumber = id("max-number").value;

    let endingTime = id("display-area").textContent;
    let score = id("score").textContent;
    let skips = Number(questionAmount) - Number(score);
    let rulesElements = qsa("#results div div span");
    let operationsString = operationsType.join(" ");

    rulesElements[0].textContent = questionAmount;
    rulesElements[1].textContent = inputType;
    rulesElements[2].textContent = operationsString;
    rulesElements[3].textContent = termAmount;
    rulesElements[4].textContent = maxNumber;

    let statsElements = qsa("#stats div");
    let scoreElement = statsElements[0];
    let timeElement = statsElements[1];
    let skipsElement = statsElements[2];

    scoreElement.children[1].textContent = score;
    timeElement.children[1].textContent = endingTime;
    skipsElement.children[1].textContent = skips;
  }

  /**
   * Calculations game to Calculations results page transition.
   */
  function transitionToResults() {
    id("calculations-game").classList.add("hidden");
    id("results").classList.remove("hidden");
  }

  /**
   * Calculations skips the current question when the skip button is pressed.
   */
  function skipQuestion() {
    appendX();
    nextQuestion();
    playSkipSound();
  }

  /**
   * Adds the x symbol over the current question to show it is incorrect.
   */
  function appendX() {
    let oldCurrentQuestion = id("current-question");
    let image = gen("img");
    image.src = "img/x-mark.png";
    image.alt = "red letter X";
    image.classList.add("x-mark");
    oldCurrentQuestion.appendChild(image);
  }

  /**
   * Calculations results to Calculations main menu page transition.
   */
  function calculationsResultsToMenu() {
    id("results").classList.add("hidden");
    id("main-menu").classList.remove("hidden");
  }

  /**
   * Sets calculations to its initial state before the game started.
   */
  function clearCalculationState() {
    stop();
    reset();
    id("questions").innerHTML = "";

    let spacingElement = gen("div");
    spacingElement.id = "start-space-0";

    id("questions").appendChild(spacingElement);
    id("score").textContent = 0;

    let inputType = getInputType();
    inputType.remove();

    let userButtons = qsa("#user-section button");

    for (let i = 0; i < userButtons.length; i++) {
      clearAllEventListeners(userButtons[i]);
    }

    can = undefined;

  }

  /**
   * Gets the input type currently on the page.
   * @returns {HTMLElement} input type.
   */
  function getInputType() {
    let inputType;

    if(id("can") != null) inputType = id("can");
    if(id("type-input") != null) inputType = id("type-input");

    return inputType;
  }

  /**
   * Checks for the counting's input rule and animations that only one of the options is selected
   * and deselects the previous option
   */
  function countingRulesSelector() {

    let buttons;

    if (this.parentNode.id ===  "counting-input-type") {
      buttons = qsa("#counting-input-type p");
    } else if (this.parentNode.id === "counting-animations-check") {
      buttons = qsa("#counting-animations-check p");
    } else {
      this.classList.toggle("selected");
      return;
    }

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] !== this) {
        buttons[i].classList.remove("selected");
      } else {
        this.classList.toggle("selected");
      }
    }
  }

  /**
   * Checks the counting rules are filled out properly, if not throw error screen, else
   * switch to the game and starts counting game.
   */
  function countingRulesToGame() {
    let roundAmount = id("rounds").value;
    let inputType = countingInputType();
    let animationCheck = countingAnimationsValueCheck();
    let filledOutCheck = roundAmount === "" || inputType == null || animationCheck == null;
    let roundAmountCheck = Number(roundAmount) <= 0;

    if (roundAmountCheck) {
      countingDisplayRoundError();
    } else if (filledOutCheck) {
      countingDisplayBlankValuesError();
    } else {
      id("counting-menu").classList.add("hidden");
      id("counting-game").classList.remove("hidden");
      setCountingRulesLocalStorage(roundAmount, inputType, animationCheck);
      startCounting(roundAmount, inputType, animationCheck);
    }
  }

  /**
   * Sets the local storage of the counting rules as an object so it can be updated on refresh
   * through previousCountingRulesSetup.
   * @param {String} roundAmount - amount of game rounds.
   * @param {String} inputType - Write or Type, user's input.
   * @param {String} animationCheck - Enabled or Disabled, user's selected option.
   */
  function setCountingRulesLocalStorage(roundAmount, inputType, animationCheck) {
    let rules = {
      "roundAmount": roundAmount,
      "inputType": inputType,
      "animationCheck": animationCheck
    }

    window.localStorage.setItem("countingRules", JSON.stringify(rules));
  }

  /**
   * Updates the counting rules to its previous state through local storage.
   */
  function previousCountingRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("countingRules"));
    id("rounds").value = rules["roundAmount"];

    let inputsElement = qsa("#counting-input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }

    let animationText = "Disabled";
    if (rules["animationCheck"]) {
      animationText = "Enabled";
    }

    let animationElement = qsa("#counting-animations-check p");
    for (let i = 0; i < animationElement.length; i++) {
      if (animationElement[i].textContent === animationText) {
        animationElement[i].classList.add("selected");
      }
    }
  }


  /**
   * Transitions from rules to game and sets up the game by activating the timer, user input, and
   * then display rounds.
   * @param {String} roundAmount - amount of game rounds
   * @param {String} inputType - Write or Type, user's input
   * @param {String} animationCheck - Enabled or Disabled, user's selected option
   */
  function startCounting(roundAmount, inputType, animationCheck) {

    start();
    totalRoundCounter = Number(roundAmount);
    let parentElement = id("user-section-counting");

    displayRoundCounting(roundAmount, animationCheck);

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        checkAnswerCounting(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      ["click", "touchend"].forEach(function(e) {
        id("can").addEventListener(e,() => {
          can.recognize();
        });
      });

      qs("#user-section-counting button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestionCounting();
      });

      qsa("#user-section-counting button")[1].addEventListener("click", () =>  {
        can.erase();
        skipQuestionCounting();
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
          checkAnswerCounting([inputElementData], null);
        } else {
          clearCurrentQuestionCounting();
        }
      })

      qsa("#user-section-counting button")[0].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestionCounting();
      });

      qsa("#user-section-counting button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        skipQuestionCounting();
      });
    }
  }

  /**
   * Displays the current random amount of divs for the round and question prompt.
   * @param {String} roundAmount - current amount of rounds
   * @param {Boolean} animations - if there is animations or not based on user's rule decision
   */
  function displayRoundCounting(roundAmount, animations) {

    // if (Number(roundAmount) === 0) {
    //   countingEndgame();
    // }

    const MINIMUM_NUMBER = 5;
    const MAXIMUM_NUMBER = 20;

    let divAmount = getRandomIntBetween(MINIMUM_NUMBER, MAXIMUM_NUMBER);
    let divs = generateCountingDivs(divAmount, animations);

    for (let i = 0; i < divs.length; i++) {
      let currentDiv = divs[i];
      let pElement = currentDiv.children[0];

      id("questions-counting").appendChild(currentDiv);

      if (pElement.classList.contains("moving")) {
        movingDiv(pElement, pElement.style.left, pElement.style.top);
      }
    }

    getAnswerToQuestionPrompt();
  }

  /**
   * Looks at all the displayed word divs and counts all the divs which matches the answer div and
   * updates the answer variable.
   */
  function getAnswerToQuestionPrompt() {

    countingAnswer = null;

    let answerElement = countingAnswerDiv.cloneNode(true);
    let answerTextContent = answerElement.textContent;
    let answerFontColor = answerElement.style.color;

    let answerAnimation;
    for (let i = 0; i < ANIMATIONS.length; i++) {
      if (answerElement.classList.contains(ANIMATIONS[i])) answerAnimation = ANIMATIONS[i];
    }

    let words = qsa("#questions-counting div p");
    let counter = 0;
    for (let i = 0; i < words.length; i++) {
      let currentWord = words[i];
      let equals;

      if (answerAnimation == null) {

        let hasAnimationCheck = false;
        for (let i = 0; i < ANIMATIONS.length; i++) {
          if (currentWord.classList.contains(ANIMATIONS[i])) hasAnimationCheck = true;
        }

        equals = currentWord.textContent === answerTextContent &&
        !hasAnimationCheck &&
        currentWord.style.color === answerFontColor;
      } else {
        equals = currentWord.textContent === answerTextContent &&
        currentWord.classList.contains(answerAnimation) &&
        currentWord.style.color === answerFontColor;
      }

      if (equals) counter++;
    }

    countingAnswer = counter;
  }

  /**
   * Generates randomized divs of animations, color, and text, by generating basis divs then
   * generating randomized amount of those div with random positions.
   * @param {Number} divAmount - maximum amount of divs, randomly generated.
   * @param {Boolean} animations - if there is animations or not based on user's rule decision.
   * @returns {HTMLElement[]} - divs to display to the user.
   */
  function generateCountingDivs(divAmount, animations) {
    let randomInt = getRandomIntBetween(3, divAmount);
    let basisDivs = [];

    for (let i = 0; i < randomInt; i++) {
      let currentDiv = gen("div");
      let currentP = gen("p");

      currentDiv.appendChild(currentP);
      currentP.textContent = COLORS[getRandomIndex(COLORS)];
      currentP.style.color = COLORS[getRandomIndex(COLORS)];

      if (animations && Math.random() < 0.5) {
        currentP.classList.add(ANIMATIONS[getRandomIndex(ANIMATIONS)]);
      }

      basisDivs.push(currentDiv);
    }

    let countingDivs = [];
    for (let i = 0; i < divAmount; i++) {
      let randomDiv = basisDivs[getRandomIndex(basisDivs)];
      let cloneDiv = randomDiv.cloneNode(true);
      countingDivs.push(cloneDiv);
    }

    let area = id("questions-counting");

    //positioning
    for (let i = 0; i < countingDivs.length; i++) {
      let element = countingDivs[i].children[0];
      let xPosition = getRandomIntBetween(1, area.clientWidth);

      while (xPosition + element.clientWidth + 100 >= area.clientWidth) {
        xPosition = getRandomIntBetween(1, area.clientWidth);
      }

      let yPosition = getRandomIntBetween(1, area.clientHeight);
      while (yPosition + element.clientHeight + 100 >= area.clientHeight || yPosition <= id("question-prompt").offsetHeight + 75) {
        yPosition = getRandomIntBetween(id("question-prompt").offsetHeight,area.clientHeight);
      }

      element.style.left = xPosition + "px";
      element.style.top = yPosition + "px";
    }

    generateQuestionPromptCounting(basisDivs, ANIMATIONS);
    return countingDivs;
  }

  /**
   * Picks a random basis div and creates the question prompt for the user to answer.
   * @param {HTMLElement[]} basisDivs - all the possible divs type in the round.
   * @param {Boolean} animations - if there is animations or not based on user's rule decision.
   */
  function generateQuestionPromptCounting(basisDivs, animations) {
    let randomDiv = basisDivs[getRandomIndex(basisDivs)].cloneNode(true).children[0];
    let spanPrompts = qsa("#question-prompt span");
    let animationSpan = spanPrompts[0];
    let matchingSpan = spanPrompts[1];

    countingAnswerDiv = randomDiv.cloneNode(true);

    let randomDivAnimation;
    for (let i = 0; i < animations.length; i++) {
      if (randomDiv.classList.contains(animations[i])) {
        randomDivAnimation = animations[i];
        randomDiv.classList.remove(animations[i]);
      }
    }

    if (randomDivAnimation != null) {
      animationSpan.textContent = randomDivAnimation;
    } else {
      animationSpan.textContent = "motionless"; // could use static but static kinda a complex word
    }

    matchingSpan.appendChild(randomDiv);
  }

  /**
   * Applies the movement of the moving class counting divs and updates its movement within the box
   * of the question display area.
   * @param {HTMLElement} element - div with the moving class.
   * @param {Number} xPositionElement - element.style.left value.
   * @param {Number} yPositionElement - element.style.top value.
   */
  function movingDiv(element, xPositionElement, yPositionElement) {
    const FPS = 75;
    let area = id("questions-counting");

    let xPosition = Number(xPositionElement.match(/^[0-9]+/)[0]);
    let yPosition = Number(yPositionElement.match(/^[0-9]+/)[0]);
    let xSpeed = getRandomIntBetween(1,5);
    let ySpeed = getRandomIntBetween(1,5);

    if (Math.random() < 0.5) xSpeed = -xSpeed;
    if (Math.random() < 0.5) ySpeed = -ySpeed;

    let timerID = setInterval(() => {
      element.id = timerID;
      if (xPosition + element.clientWidth > area.clientWidth - 10 || xPosition < 0) xSpeed = -xSpeed;
      if (yPosition + element.clientHeight > area.clientHeight - 50 || yPosition < id("question-prompt").clientHeight) ySpeed = -ySpeed;

      xPosition = xPosition + xSpeed;
      yPosition = yPosition + ySpeed;

      updatePosition(element, xPosition, yPosition);
    }, 1000/FPS);

    setIntervalTimerIDs.push(timerID);
  }

  /**
   * Updates the element's left and top position.
   * @param {HTMLElement} element - div with the moving class.
   * @param {Number} xPositionElement - current x-position in question box
   * @param {Number} yPositionElement - current y-position in question box
   */
  function updatePosition(element, xPosition, yPosition) {
    element.style.left = xPosition + "px";
    element.style.top = yPosition + "px";
  }

  /**
   * When the user updates their counting user-input, this handles if the input is correct or not and updates accordingly.
   * @param {String[]} data - User's input, String[] is used due to the handwriting making a prediction of what the input means.
   * @param {Object} can - Canvas object where the user writes their input.
   */
  function checkAnswerCounting(data, can) {

    if (data == null) { //undefined and null
      return;
    }

    let parsedData = []; // only numbers
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        parsedData.push(data[i]);
      }
    }

    if (Number(parsedData[0]) === Number(countingAnswer) && parsedData.length > 0) {

      if (can != null) {
        can.erase();
      } else {
        id("type-input").value = "";
      }

      playCorrectAnswerSound();
      id("counting-score").textContent = Number(id("counting-score").textContent) + 1;
      nextRound();
    } else if (parsedData.length > 0) {
      id("user-answer").textContent = parsedData[0];
    } else {
      id("user-answer").textContent = "";
    }
  }

  /**
   * Updates the state of the game to showcase the next round. If no more rounds, goes to the endgame.
   */
  function nextRound() {
    totalRoundCounter = totalRoundCounter - 1;

    if (totalRoundCounter === 0) {
      countingEndgame();
      return;
    }

    clearCountingDivs();
    displayRoundCounting(totalRoundCounter, countingAnimationsValueCheck());
  }

  /**
   * Clears the current round's generated values, question prompt, divs.
   */
  function clearCountingDivs() {
    clearAllSetIntervals();
    qs("#question-prompt span").textContent = "";
    qs("#question-prompt span p").remove();
    let countingDivs = qsa("#questions-counting div");
    for (let i = 0; i < countingDivs.length; i++) { countingDivs[i].remove(); }
  }

  /**
   * When the game ends due to finishing it, this function calls to transition the user and reset the game state.
   */
  function countingEndgame() {
    countingUpdateStats();
    clearCountingState();
    playWinSound();
    id("counting-game").classList.add("hidden");
    id("counting-results").classList.remove("hidden");
  }

  /**
   * Sets counting to its initial state before the game started.
   */
  function clearCountingState() {
    clearCountingDivs();
    stop();
    reset();

    let inputType = getInputType();
    inputType.remove();

    let userButtons = qsa("#counting-user-section button");
    for (let i = 0; i < userButtons.length; i++) {
      clearAllEventListeners(userButtons[i]);
    }

    id("counting-score").textContent = "0";

    can = undefined;
  }

  /**
   * Updates the counting's results page with the stats from the counting game.
   */
  function countingUpdateStats() {

    let roundAmount = id("rounds").value;
    let inputType = countingInputType();

    let animationCheck = countingAnimationsValueCheck();
    let animationText = "Disabled";
    if (animationCheck) { animationText = "Enabled"; }

    let endingTime = id("counting-display-area").textContent;
    let score = id("counting-score").textContent;
    let skips = Number(roundAmount) - Number(score);
    let rulesElements = qsa("#counting-results div div span");

    rulesElements[0].textContent = roundAmount;
    rulesElements[1].textContent = inputType;
    rulesElements[2].textContent = animationText;

    let statsElements = qsa("#counting-stats div");
    let scoreElement = statsElements[0];
    let timeElement = statsElements[1];
    let skipsElement = statsElements[2];

    scoreElement.children[1].textContent = score;
    timeElement.children[1].textContent = endingTime;
    skipsElement.children[1].textContent = skips;
  }

  /**
   * Clears the current question's user input and displayed answer.
   */
  function clearCurrentQuestionCounting() {
    id("user-answer").textContent = "";
    if (can) can.erase();
    if (id("type-input")) id("type-input").value = "";

  }

  /**
   * Skips the current question counting.
   */
  function skipQuestionCounting() {
    playSkipSound();
    clearCurrentQuestionCounting();
    nextRound();
  }

  /**
   * Gets the counting's input type from the counting rules.
   * @returns {String} Write or Type, user's input
   */
  function countingInputType() {
    let inputType;
    let inputs = qsa("#counting-input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  /**
   * Gets the counting's animation rule from the counting rules.
   * @returns {Boolean} true for animations on, false for animations off.
   */
  function countingAnimationsValueCheck() {
    let animationCheck;
    let boolean = false;
    let inputs = qsa("#counting-animations-check p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        animationCheck = inputs[i].textContent;
      } else if (animationCheck !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }

    if (animationCheck === "Enabled") {
      boolean = true;
    }

    return boolean;
  }

  /**
   * Displays that a rule is missing error to the user.
   */
  function countingDisplayBlankValuesError() {
    qs("#counting-buttons .start").removeEventListener("click", countingRulesToGame);
    id("counting-rules").classList.add("hidden");
    id("counting-missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("counting-rules").classList.remove("hidden");
      id("counting-missing-error").classList.add("hidden");
      qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    }, 1000);
  }

  /**
   * Displays that a round amount is missing or invalid to the user.
   */
  function countingDisplayRoundError() {
    qs("#counting-buttons .start").removeEventListener("click", countingRulesToGame);
    id("counting-rules").classList.add("hidden");
    id("round-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("counting-rules").classList.remove("hidden");
      id("round-number-error").classList.add("hidden");
      qs("#counting-buttons .start").addEventListener("click", countingRulesToGame);
    }, 1000);
  }

  /**
   * Counting Results page to main menu.
   */
  function countingResultsToMenu() {
    id("counting-results").classList.add("hidden");
    id("main-menu").classList.remove("hidden");
  }

  /**
   * Checks for the housing's input rule that only one of the options is selected
   * and deselects the previous option.
   */
  function housingRulesSelector() {
    let buttons;
    if (this.parentNode.id ===  "housing-input-type") {
      buttons = qsa("#housing-input-type p");
    } else {
      this.classList.toggle("selected");
      return;
    }

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] !== this) {
        buttons[i].classList.remove("selected");
      } else {
        this.classList.toggle("selected");
      }
    }
  }

  /**
   * Gets the input rule value for housing.
   * @returns {String} housing current input type (Write or Type)
   */
  function housingInputCheck() {
    let inputType;
    let inputs = qsa("#housing-input-type p");
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains("selected")) {
        inputType = inputs[i].textContent;
      } else if (inputType !== undefined && inputs[i].classList.contains("selected")) {
        console.error("Both inputs selected");
      }
    }
    return inputType;
  }

  /**
   * Checks the housing rules are filled out properly, if not throw error screen, else
   * switch to the game and starts housing game.
   */
  function housingRulesToGame() {
    let roundAmount = id("rounds-housing").value;
    let inputType = housingInputCheck();

    let filledOutCheck = roundAmount === "" || inputType == null;
    let roundAmountCheck = Number(roundAmount) <= 0;

    if (roundAmountCheck) {
      housingDisplayRoundError();
    } else if (filledOutCheck) {
      housingDisplayBlankValuesError();
    } else {
      id("housing-menu").classList.add("hidden");
      id("housing-game").classList.remove("hidden");
      setHousingRulesLocalStorage(roundAmount, inputType);
      startHousing(roundAmount, inputType);
    }
  }

  /**
   * Displays that a rule is missing error to the user.
   */
  function housingDisplayBlankValuesError() {
    qs("#housing-buttons .start").removeEventListener("click", housingRulesToGame);
    id("housing-rules").classList.add("hidden");
    id("housing-missing-error").classList.remove("hidden");
    setTimeout(() => {
      id("housing-rules").classList.remove("hidden");
      id("housing-missing-error").classList.add("hidden");
      qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);
    }, 1000);
  }

  /**
   * Displays that a round amount is missing or invalid to the user.
   */
  function housingDisplayRoundError() {
    qs("#housing-buttons .start").removeEventListener("click", housingRulesToGame);
    id("housing-rules").classList.add("hidden");
    id("housing-round-number-error").classList.remove("hidden");
    setTimeout(() => {
      id("housing-rules").classList.remove("hidden");
      id("housing-round-number-error").classList.add("hidden");
      qs("#housing-buttons .start").addEventListener("click", housingRulesToGame);
    }, 1000);
  }

  /**
   * Sets the local storage of the counting rules as an object so it can be updated on refresh
   * through previousHousingRulesSetup.
   * @param {String} roundAmount - amount of game rounds, user's input
   * @param {String} inputType - Write or Type, user's input
   */
  function setHousingRulesLocalStorage(roundAmount, inputType) {
    let rules = {
      "roundAmount": roundAmount,
      "inputType": inputType,
    }
    window.localStorage.setItem("housingRules", JSON.stringify(rules));
  }

  /**
   * Updates the housing rules to its previous state through local storage.
   */
  function previousHousingRulesSetup() {
    let rules = JSON.parse(window.localStorage.getItem("housingRules"));
    id("rounds-housing").value = rules["roundAmount"];

    let inputsElement = qsa("#housing-input-type p");
    for (let i = 0; i < inputsElement.length; i++) {
      if (inputsElement[i].textContent === rules["inputType"]) {
        inputsElement[i].classList.add("selected");
      }
    }
  }

  /**
   * Transitions from rules to game and sets up the game by activating the timer, user input, and
   * then display rounds.
   * @param {String} roundAmount - amount of game rounds
   * @param {String} inputType - Write or Type, user's input
   */
  function startHousing(roundAmount, inputType) {

    totalRoundCounterHousing = Number(roundAmount);

    let parentElement = id("user-section-housing");

    let house = gen("img");
    house.src = "img/house.png";
    house.alt = "house";
    house.classList.add("house");
    house.classList.add("top-to-down");

    house.addEventListener("animationend", () => {
      house.classList.remove("top-to-down");
      clearAllEventListeners(house);
      startRound();
    });

    id("questions-housing").appendChild(house);


    qsa("#user-section-housing button")[1].disabled = true;

    if (inputType === "Write") {
      let canvasElement = gen("canvas");
      canvasElement.id = "can";
      canvasElement.width = "500";
      canvasElement.height = "550";
      parentElement.prepend(canvasElement);
      can = new handwriting.Canvas(id("can"));

      can.setCallBack(function(data) {
        updateUserInput(data, can);
      });

      can.setOptions(
        {
          language: "en",
          numOfReturn: 5
        }
      );

      ["click", "touchend"].forEach(function(e) {
        id("can").addEventListener(e,() => {
          can.recognize();
        });
      });

      qs("#user-section-housing button").addEventListener("click", () => {
        can.erase();
        clearCurrentQuestionHousing();
      });

      qsa("#user-section-housing button")[1].addEventListener("click", () =>  {
        can.erase();
        checkAnswerHousing();
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
          updateUserInput([inputElementData], null);
        } else {
          clearCurrentQuestionHousing();
        }
      })

      qsa("#user-section-housing button")[0].addEventListener("click", () => {
        id("type-input").value = "";
        clearCurrentQuestionHousing();
      });

      qsa("#user-section-housing button")[1].addEventListener("click", () => {
        id("type-input").value = "";
        checkAnswerHousing();
      });
    }
  }

  /**
   * Clears the current question's user input and displayed answer
   */
  function clearCurrentQuestionHousing() {
    id("user-answer-housing").textContent = "";
  }

  /**
   * When the user updates their housing user-input, this handles and updates the data accordingly.
   * @param {String[]} data - User's input, String[] is used due to the handwriting making a prediction of what the input means.
   * @param {Object} can - Canvas object where the user writes their input.
   */
  function updateUserInput(data, can) {

    if (data == null) { //undefined and null
      return;
    }

    let parsedData = []; // only numbers
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        parsedData.push(data[i]);
      }
    }

    if (parsedData.length > 0) {
      id("user-answer-housing").textContent = parsedData[0];
    } else {
      id("user-answer-housing").textContent = "";
    }

  }

  /**
   * Generates and calculation a sequence of people entering and leaving the house then displays it.
   */
  function startRound() {
    peopleInHouse = 0;
    let sequence = splitHouseToUpSequence(generateSequence());
    calculateResult(sequence);
    displayRoundAnimations(sequence);
  }

  /**
   * Calculates the sequence to see how many people are in the house,
   * also checks if it is a valid sequence.
   * @param {Object[]} sequence - peopleAnimation object,
   * with two field "peopleAmount": Number, "animations": String;
   */
  function calculateResult(sequence) {
    let total = 0;
    for (let i = 0; i < sequence.length; i++) {
      let peopleAnimation = sequence[i];
      let peopleAmount = peopleAnimation["peopleAmount"];

      total += peopleAmount;

      if (total < 0) {
        console.error("invalid results");
      }

    }

    peopleInHouse = total;
  }

  /**
   * Splits the originalSequences when the peopleAnimation's animation is HouseToUp, from one index taking greater
   * than 1 people leaving, to amount of people leaving indexes and one person leaving per thing. i.e [3] -> [1,1,1];
   * @param {Object[]} originalSequence - peopleAnimation object array,
   * with two field "peopleAmount": Number, "animations": String;
   * @returns {Object[]} newSequence - original sequences with modifications for HouseToUp animation objects split.
   */
  function splitHouseToUpSequence(originalSequence) {

    let newSequence = [];

    for (let i = 0; i < originalSequence.length; i++) {
      let currentPeopleAnimation = originalSequence[i];
      let peopleAmount = currentPeopleAnimation["peopleAmount"];
      let animation = currentPeopleAnimation["animation"];

      if (animation === "house-to-top") {
        for (let j = 0; j < Math.abs(peopleAmount); j++) {
          let newPeopleAnimation = {
            "peopleAmount": -1,
            "animation": animation
          }
          newSequence.push(newPeopleAnimation)
        }
      } else {
        newSequence.push(currentPeopleAnimation);
      }
    }

    return newSequence;
  }

  /**
   * Gets the user's final answer and compares it to the actual answer, then showcases if it was
   * right or wrong then goes to the next round.
   */
  function checkAnswerHousing() {

    stop();

    let actualAnswer = peopleInHouse;
    let finalAnswer = Number(id("user-answer-housing").textContent);
    let peopleDiv = generatePeople(peopleInHouse);
    peopleDiv.classList.remove("people");
    peopleDiv.classList.add("results-house");

    id("questions-housing").appendChild(peopleDiv);

    qs(".house").classList.add("down-to-top");
    qs(".house").addEventListener("animationend", () => {

      if (finalAnswer === actualAnswer) {
        playCorrectAnswerSound();
        id("housing-score").textContent = Number(id("housing-score").textContent) + 1;
      } else {
        playSkipSound();
      }

      totalRoundCounterHousing -= 1;
      nextRoundHousing();
    });
  }

  /**
   * Clears the current round to their initial state, then starts the next round when the house is
   * re-added.
   */
  function nextRoundHousing() {

    qs(".house").remove();
    qs(".results-house").remove();

    qsa("#user-section-housing button")[1].disabled = true;
    clearCurrentQuestionHousing();

    if (totalRoundCounterHousing === 0) {
      housingEndgame();
      return;
    }

    let house = gen("img");
    house.src = "img/house.png";
    house.alt = "house";
    house.classList.add("house");
    house.classList.add("top-to-down");

    house.addEventListener("animationend", () => {
      house.classList.remove("top-to-down");
      clearAllEventListeners(house);
      startRound();
    });

    id("questions-housing").appendChild(house);

  }

  /**
   * When the game ends due to finishing it, this function calls to transition the user and reset the game state.
   */
  function housingEndgame() {
    housingUpdateStats();
    clearHousingState();
    playWinSound();
    id("housing-game").classList.add("hidden");
    id("housing-results").classList.remove("hidden");
  }

  function housingUpdateStats() {

    let roundAmount = id("rounds-housing").value;
    let inputType = housingInputCheck();

    let endingTime = id("housing-display-area").textContent;
    let score = id("housing-score").textContent;
    let skips = Number(roundAmount) - Number(score);
    let rulesElements = qsa("#housing-results div div span");

    rulesElements[0].textContent = roundAmount;
    rulesElements[1].textContent = inputType;

    let statsElements = qsa("#housing-stats div");
    let scoreElement = statsElements[0];
    let timeElement = statsElements[1];
    let skipsElement = statsElements[2];

    scoreElement.children[1].textContent = score;
    timeElement.children[1].textContent = endingTime;
    skipsElement.children[1].textContent = skips;
  }

  /**
   * Sets housing to its initial state before the game started.
   */
  function clearHousingState() {
    reset();
    getInputType().remove();

    let userButtons = qsa("#housing-user-section button");
    for (let i = 0; i < userButtons.length; i++) {
      clearAllEventListeners(userButtons[i]);
    }

    id("housing-score").textContent = "0";
    qsa("#user-section-housing button")[1].disabled = true;

    can = undefined;
  }

    /*
    peopleAnimation = {
      "peopleAmount": people,
      "animation": animation
    };
  */

  /**
   * Goes through the sequences and displays it to user one by one starting at index 0.
   * @param {Object[]} sequence - peopleAnimation object array,
   * with two field "peopleAmount": Number, "animations": String;
   */
  function displayRoundAnimations(sequence) {
    let sequenceIndex = 0;
    let firstPeople = sequence[sequenceIndex];
    let firstPeopleAmount = firstPeople["peopleAmount"];
    let firstPeopleAnimation = firstPeople["animation"];

    let peopleElement = generatePeople(firstPeopleAmount);
    peopleElement.classList.add(firstPeopleAnimation);

    id("questions-housing").appendChild(peopleElement);

    peopleElement.addEventListener("animationend", function () {
      displayRoundAnimationsHelper(sequence, sequenceIndex + 1);
      peopleElement.remove();
    });

  }

  /**
   * Recursive Helper function, goes through the and displays it to user one by one
   * @param {*} sequence - peopleAnimation object array,
   * with two field "peopleAmount": Number, "animations": String;
   * @param {*} index - current index of the sequence array
   */
  function displayRoundAnimationsHelper(sequence, index) {

    // base case
    if (index === sequence.length) {
      start();
      activateSubmitButton();
      return;
    }

    let people = sequence[index];
    let peopleAmount = people["peopleAmount"];
    let peopleAnimation = people["animation"];

    let peopleElement = generatePeople(peopleAmount);
    peopleElement.classList.add(peopleAnimation);
    id("questions-housing").appendChild(peopleElement);

    peopleElement.addEventListener("animationend", function () {
      displayRoundAnimationsHelper(sequence, index + 1);
      peopleElement.remove();
    });

  }

  /**
   * Activates the housing confirm answer / submit button.
   */
  function activateSubmitButton() {
    qsa("#user-section-housing button")[1].disabled = false;
  }

  /**
   * Generates the valid people joining and leaving sequence with amount and animation.
   * @returns {Object[]} peopleAnimation object array,
   * with two field "peopleAmount": Number, "animations": String;
   */
  function generateSequence() {
    // a valid sequence is when there is never less than 0 people in the house at any state.
    // 0 total people [2 people enter, 1 person leaves, 1 person enters] total people 3, valid sequence.
    // 0 total people [2 people leave, 1 person joins, 5 people join] total people 4, invalid sequence
    // since there was -2 people at one point.

    let validSequence = false;
    let finalSequence = [];
    let numberSequence = [];

    const LEAVING_ANIMATIONS = ["house-to-top", "house-to-left", "house-to-right"];
    const ENTERING_ANIMATIONS = ["left-to-house", "right-to-house"];

    const MAXIMUM_PEOPLE_PER_STATE = 3;

    while (validSequence === false) {
      let sequenceLength = getRandomIntBetween(2, 8 + 1);
      let numberOfPeople = 0;

      for (let i = 0; i < sequenceLength; i++) {
        let people = Number(getRandomIntBetween(1, MAXIMUM_PEOPLE_PER_STATE + 1));

        if (Math.random() < 0.5 && numberOfPeople > 0) {
          people = -people;
        }

        numberOfPeople += people;
        numberSequence.push(people);

        if (numberOfPeople < 0) {
          numberSequence = [];
          break;
        }
      }

      if (numberOfPeople >= 0 && numberSequence.length > 0) {
        validSequence = true;
      }
    }

    for (let i = 0; i < numberSequence.length; i++) {
      let currentAmountOfPeople = numberSequence[i];
      let peopleAnimation;
      if (currentAmountOfPeople > 0) {
        let randomEnteringAnimation = ENTERING_ANIMATIONS[getRandomIndex(ENTERING_ANIMATIONS)];
        peopleAnimation = {
          "peopleAmount": currentAmountOfPeople,
          "animation": randomEnteringAnimation
        };
      } else {
        let randomLeavingAnimation = LEAVING_ANIMATIONS[getRandomIndex(LEAVING_ANIMATIONS)];
        peopleAnimation = {
          "peopleAmount": currentAmountOfPeople,
          "animation": randomLeavingAnimation
        }
      }

      finalSequence.push(peopleAnimation);
    }

    return finalSequence;
  }

  /**
   * Generates the people div to display.
   * @param {Number} peopleAmount - amount of people in the group.
   * @returns {HTMLElement} - people div, with the peopleAmount of persons.
   */
  function generatePeople(peopleAmount) {

    let people = gen("div");
    people.classList.add("people");

    for (let i = 0; i < Math.abs(peopleAmount); i++) {
      let person = generatePerson();
      people.appendChild(person);
    }

    return people;
  }
1
  /**
   * Generates the person image for generate people.
   * @returns {HTMLElement} - image of the stick-figure image.
   */
  function generatePerson() {
    let img = gen("img");
    img.src = "img/person.png";
    img.alt = "person";
    img.classList.add("person");
    return img;
  }

  // written code snippet from https://stackoverflow.com/questions/26329900/how-do-i-display-millisecond-in-my-stopwatch
  let timeBegan = null
    , timeStopped = null
    , stoppedDuration = 0
    , started = null;

  /**
   * Starts the stopwatch timer.
   */
  function start() {
      if (timeBegan === null) {
          timeBegan = new Date();
      }

      if (timeStopped !== null) {
          stoppedDuration += (new Date() - timeStopped);
      }

      started = setInterval(clockRunning, 10);
  }

  /**
   * Stops the stopwatch timer.
   */
  function stop() {
      timeStopped = new Date();
      clearInterval(started);
  }

  /**
   * Resets the stopwatch timer.
   */
  function reset() {
      clearInterval(started);
      stoppedDuration = 0;
      timeBegan = null;
      timeStopped = null;
      document.getElementById("display-area").innerHTML = "00:00:00.000";
      document.getElementById("counting-display-area").innerHTML = "00:00:00.000";
      document.getElementById("housing-display-area").innerHTML = "00:00:00.000";
  }

  /**
   * Updates the stopwatch timer.
   */
  function clockRunning(){
      let currentTime = new Date()
          , timeElapsed = new Date(currentTime - timeBegan - stoppedDuration)
          , hour = timeElapsed.getUTCHours()
          , min = timeElapsed.getUTCMinutes()
          , sec = timeElapsed.getUTCSeconds()
          , ms = timeElapsed.getUTCMilliseconds();

      if (document.getElementById("display-area")) {
        document.getElementById("display-area").innerHTML =
          (hour > 9 ? hour : "0" + hour) + ":" +
          (min > 9 ? min : "0" + min) + ":" +
          (sec > 9 ? sec : "0" + sec) + "." +
          (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
      }

      if (document.getElementById("counting-display-area")) {
        document.getElementById("counting-display-area").innerHTML =
          (hour > 9 ? hour : "0" + hour) + ":" +
          (min > 9 ? min : "0" + min) + ":" +
          (sec > 9 ? sec : "0" + sec) + "." +
          (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
      }

      if (document.getElementById("housing-display-area")) {
        document.getElementById("housing-display-area").innerHTML =
          (hour > 9 ? hour : "0" + hour) + ":" +
          (min > 9 ? min : "0" + min) + ":" +
          (sec > 9 ? sec : "0" + sec) + "." +
          (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
      }
  };

  /** ------------------------------ Helper Functions  ------------------------------ */

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

  /**
   * Clears all the event listeners for the element given.
   * @param {HTMLElement} element - any HTMLElement
   */
  function clearAllEventListeners(element) {
    let oldElement = element
    let newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }

  /**
   * Generates a random number from 0 to given max number.
   * @param {Number} max - Maximum possible number - 1
   * @returns {Number} - Random max number.
   */
  function getRandomInt(max) {
    return Math.floor(Math.random() * (Number(max) + 1));
  }

  /**
   * Generates a random number from given min to max number.
   * @param {Number} min - Minimum number
   * @param {Number} max - Maximum number
   * @returns random number in the range min to max - 1
   */
  function getRandomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Generates a random number from 0 to maximum available index of the array.
   * @param {Object[]} array - any array.
   * @returns {Number} Random index in the array.
   */
  function getRandomIndex(array) {
    return Math.floor(Math.random()*array.length);
  }

  /**
   * Clears all set intervals timerIds.
   */
  function clearAllSetIntervals () {
    for (let i = 0; i < setIntervalTimerIDs.length; i++) {
      let timerID = setIntervalTimerIDs[i];
      clearInterval(timerID);
    }
  }
})();