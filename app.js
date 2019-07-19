"use strict";
//BUDGET CONTROLLER
let budgetController = (function(){

  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome >0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem(type, des, val) {
      let newItem, ID;

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem(type, id) {
      let ids, index;
      ids = data.allItems[type].map((cur) => cur.id);
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget() {
      // calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc >0 ) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages() {
      data.allItems.exp.forEach((cur) => cur.calcPercentage(data.totals.inc));
    },

    getPercentages() {
      return data.allItems.exp.map((cur) => cur.getPercentage());
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      }
    },

    testing() {
      console.log(data);
    },
  }

})();


//UI CONTROLLER
let UIController = (function(){

  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    itemPercentage: '.item__percentage',
    dateLabel: '.budget__title--month',
  };


  const formatNumber = function(num, type) {
    let numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? '-' : '+') + ' ' + int + '.' + dec;
  };

  const nodeListForEach = function(list, callback) {
    for (let i=0; i<list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: Number(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem(obj, type) {
      let html, element;

      //copy html and replace placeholders with the variables
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `
        <div class="item clearfix" id="inc-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, type)}</div>
            <div class="item__delete">
              <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
          </div>
        </div>
      `;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `
        <div class="item clearfix" id="exp-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, type)}</div>
            <div class="item__percentage">---</div> 
            <div class="item__delete">
              <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
          </div>
        </div>
        `;
      }

      //insert html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },

    deleteListItem(selectorID) {
      let element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields() {
      let fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      let fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(current => current.value = '');

      fieldsArr[0].focus();
    },

    displayBudget(obj) {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages(percentages) {
      const fields = document.querySelectorAll(DOMstrings.itemPercentage);

      nodeListForEach(fields, (cur, index) => {
        if (percentages[index] > 0) {
          cur.textContent = percentages[index] + '%';
        } else {
          cur.textContent = '---';
        }
      });

    },

    displayMonth() {
      let now, year, month;
      let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType() {
      let fields = document.querySelectorAll(`${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`);
      nodeListForEach(fields, (cur) => cur.classList.toggle('red-focus'));
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings() {
      return DOMstrings;
    },

  };

})();


//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

  const setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', (event) => {
      if (event.key === "Enter" || event.which === 13) {
        event.preventDefault();
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  const updateBudget = function() {

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    let budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  const updatePercentages = function() {
    //1 Calc percentage
    budgetCtrl.calculatePercentages();

    //2 Read perc from budg contrl
    let percentages = budgetCtrl.getPercentages();

    //3 Update UI with new percentage
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function() {
    let input, newItem;

    // 1. Get the input data
    input = UICtrl.getInput();

    if (input.description !== '' && input.value > 0 && !isNaN(input.value) ) {
      // 2. Add the item to thw budget
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update the budget
      updateBudget();

      //6. calc and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function(event) {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {

      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1 delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      //2 delete item from the UI
      UICtrl.deleteListItem(itemID);

      //3 update and show the new budget
      updateBudget();

      //4 calc and update percentages
      updatePercentages();
    }
  };

  return {
    init() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();