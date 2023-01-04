// *********************************SETTINGS***************************************************

const basketDisplay = document.querySelector("#cart__items");
const numberOfProducts = document.querySelector("#totalQuantity");
const priceOfProducts = document.querySelector("#totalPrice");
const basketForm = document.querySelector(".cart__order__form");
const userFields = document.querySelectorAll("input");

let numberInputs;
let deleteBtns;

let products = [];
let idOfProducts = [];
let basketInfos = [];
let totalAmount = 0;
let totalNumber = 0;

let firstName, lastName, address, city, email;

//***********************************FUNCTIONS*************************************************

// Putting the modifications in the localStorage in JSON in an Array called basket
const setBasket = (basket) => {
    localStorage.setItem("basket", JSON.stringify(basket));
}

// Getting back the array called basket stocked in the localStorage and turning into a JS Object
const getBasket = () => {
    let basket = localStorage.getItem("basket");
    if (basket == null) {
        return [];
    } else {
        return JSON.parse(basket);
    }
}

// Getting back the basket to collect every id with the purpose to put them in an array
const idCollector = () => {
    let basket = getBasket();
    for (i = 0; i < basket.length; i++) {
        if (idOfProducts.indexOf(basket[i].id) === -1) {
            idOfProducts.push(basket[i].id)
        }
        products.push(basket[i].id);
    }
}

// Searching inside the Array containing the ids of every products in the basket with the purpose to get back the price from the server
// And creating a new Array made of objects containing that data
// @param {type: Array}
const priceHunter = async (idArr) => {
    for (i = 0; i < idArr.length; i++) {
        let id = idArr[i];
        await fetch("http://localhost:3000/api/products/" + idArr[i])
            .then((res) => res.json())
            .then((data) => basketInfos.push({
                id: id,
                name: data.name,
                price: data.price,
            }))
    }
}


// Changing the input's modification on the DOM and the localStorage
// Have to reboot all the values reporting to the total before calling the main function or total allways increasing
//@param {type:Object} --> the param of the input events
const storingNewQuantity = (e) => {
    totalAmount = 0;
    totalNumber = 0;

    let basket = getBasket();
    let rightProduct = basket.find((p) => p.datasetid === e.target.dataset.inputid);

    if (rightProduct != undefined) {
        rightProduct.quantity = e.target.value;
    }
    setBasket(basket);
    main();
}

// Suppressing a product from the localStorage then refreshing the DOM
// Have to reboot all the values reporting to the total before calling the main function or total allways increasing
//@param {type:Object} --> the param of the click events
const removeProduct = (e) => {
    totalAmount = 0;
    totalNumber = 0;

    let basket = getBasket();
    let rightProductIndex = basket.findIndex((p) => p.datasetid == e.target.dataset.btnid);

    if (rightProductIndex != undefined) {
        basket.splice(rightProductIndex, 1); 
    }
    setBasket(basket);
    main()
}

// Inserting all the data from the localStorage in the DOM
// For each elements of the basket --> Compare the id of the element with the ids present in the Array created by the function priceHunter()
// When there is a match we fill the variable with the price indicated by the array
// Then we calculate the amount of each product by multiplying his price by his quantity
// Then we start increasing the total price and the total of products at each loop of the map
// Inserting 'data-set' to the inputs and to the btn to select them easier in the futur
const basketDisplayer = () => {
    let basket = getBasket(); 

    basketDisplay.innerHTML = basket.map((product) => {
        let priceByProduct;

        if (basketInfos.find(i => i.id === product.id)) {
            priceByProduct = basketInfos.find(i => i.id === product.id).price;
        }

        let totalPriceByProduct = priceByProduct * parseInt(product.quantity);
        totalAmount += parseInt(totalPriceByProduct);
        totalNumber += parseInt(product.quantity);
        
       return `
            <article class="cart__item" data-id=${product.id} data-color=${product.color}>
                <div class="cart__item__img">
                    <img src=${product.image} alt="Photographie d'un ${product.name}">
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${product.name}</h2>
                        <p>${product.color}</p>
                        <p>${priceByProduct},00 €</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : ${product.quantity}</p>
                            <input type="number" id=${product.id} data-inputid=${product.datasetid} class="itemQuantity" name="itemQuantity" min="1" max="100" value=${product.quantity}>
                        </div>
                        <div class="cart__item__content__settings__delete">
                            <p data-btnid=${product.datasetid} class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>
        `

    })
}

// Charging of displaying all the big functions
// Starting by collecting all the prices before displaying all the data
// When the data has been displayed addition of an event on the new inputs to be able to change the quantity of a product
// When the data has been displayed addition of an event on the new buttons to be able to remove the product form the basket
// Then also displaying the value related to the total of the basket
const main = async () => {
    await priceHunter(idOfProducts)
    basketDisplayer();

    numberInputs = document.querySelectorAll("input[type=number]");
    deleteBtns = document.querySelectorAll(".deleteItem");

    numberInputs.forEach((input) => {
        input.addEventListener("input", (e) => {
            storingNewQuantity(e);
        })
    })

    deleteBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            removeProduct(e);
        })
    })

    numberOfProducts.textContent = totalNumber;
    priceOfProducts.textContent = totalAmount;
}

idCollector();
main();



//*********************************************FORM PART******************************************** */

// Handling the behavior of the entiere form
// @params {type: String} --> Select the right input
// @params {type: String} --> Display a message to reveal to the user how he managed to fill the field
// @params {type: Boolean} --> Say to the function if the field is correctly fill
// Changes the style of the border in function of valid or not
const errorDisplay = (id, message, valid) => {
    const inpt = document.getElementById(id);
    const errorMsg = document.querySelector("#" + id + "+ p");
    if (!valid) {
        inpt.style.border = "2px solid red";
        errorMsg.textContent = message;
    } else {
        inpt.style.border = "2px solid green";
        errorMsg.textContent = message;
    }
}

// Handle the behavior of the firstName input
// @params {type: String} --> the value send by the user that is going to be analyzed
// The first condition checks the value's length --> Does'nt have to be short or too long and the user need to start to writte
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The second condition checks the characters that the value contains --> Only letters and have to start with an uppercase
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The third condition represents the moment when the user correctly filled the field
// We say to the function that it is ok, the function says it to the user and it set value to the related variable
const firstNameChecker = (value) => {
    if (value.length > 0 && (value.length < 3 || value.length > 20)) {
        errorDisplay("firstName", "Le prénom inséré ne possède pas un nombre de caractères accepté.")
        firstName = null;
    } else if (!value.match(/^[A-Z][A-Za-z\é\è\ê\-]+$/)) {
        errorDisplay("firstName", "Veuillez commencer par une majuscule. Certains caractères spéciaux ne sont pas acceptés pour ce champ");
        firstName = null;
    } else {
        errorDisplay("firstName", "Prénom validé", true);
        firstName = value;
    }
}

// Handle the behavior of the lastName input
// @params {type: String} --> the value send by the user that is going to be analyzed
// The first condition checks the value's length --> Does'nt have to be short or too long and the user need to start to writte
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The second condition checks the characters that the value contains --> Only letters and have to start with an uppercase
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The third condition represents the moment when the user correctly filled the field
// We say to the function that it is ok, the function says it to the user and it set value to the related variable
const lastNameChecker = (value) => {
    if (value.length > 0 && (value.length < 3 || value.length > 30)) {
        errorDisplay("lastName", "Le nom inséré ne possède pas un nombre de caractères accepté.")
        lastName = null;
    } else if (!value.match(/^[A-Z][A-Za-z\é\è\ê\-]+$/)) {
        errorDisplay("lastName", "Veuillez commencer par une majuscule. Certains caractères spéciaux ne sont pas acceptés pour ce champ");
        lastName = null;
    } else {
        errorDisplay("lastName", "Nom validé", true);
        lastName = value;
    }
}

// Handle the behavior of the address input
// @params {type: String} --> the value send by the user that is going to be analyzed
// The first condition checks if the value seams like a real address
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The second condition represents the moment when the user correctly filled the field
// We say to the function that it is ok, the function says it to the user and it set value to the related variable
const addressChecker = (value) => {
    if (!value.match(/^\d+\s+\w+\s+\w+/)) {
        errorDisplay("address", "Veuillez saisir une adresse valide.");
        address = null;
    } else {
        errorDisplay("address", "Adresse validée", true);
        address = value
    }
}

// Handle the behavior of the city input
// @params {type: String} --> the value send by the user that is going to be analyzed
// The first condition checks the value's length --> Does'nt have to be short or too long and the user need to start to writte
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The second condition checks the characters that the value contains --> Only letters and have to start with an uppercase
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The third condition represents the moment when the user correctly filled the field
// We say to the function that it is ok, the function says it to the user and it set value to the related variable
const cityChecker = (value) => {
    if (value.length > 0 && (value.length < 3 || value.length > 20)) {
        errorDisplay("city", "La ville insérée est trop longue.");
        city = null;
    } else if (!value.match(/^[A-Z][A-Za-z\é\è\ê\-]+$/)) {
        errorDisplay("city", "Veuillez commencer par une majuscule. Certains caractères spéciaux ne sont pas acceptés pour ce champ");
        city = null;
    } else {
        errorDisplay("city", "Ville validée", true);
        city = value;
    }
}

// Handle the behavior of the mail address input
// @params {type: String} --> the value send by the user that is going to be analyzed
// The first condition checks if the value seams like a real mail address
// If this condition isn't correctly filled displays an appropriate message and set the related variable on null to be sure that the user doesn't try to trick us
// The second condition represents the moment when the user correctly filled the field
// We say to the function that it is ok, the function says it to the user and it set value to the related variable
const emailChecker = (value) => {
    if (!value.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)) {
        errorDisplay("email", "Veuillez entrer une adresse mail valide");
        email = null;
    } else {
        errorDisplay("email", "Email validé", true);
        email = value;
    }
}

// Post the order to the API and clear the local storage
// @params {type: Object} --> Represents the settings of the POST method for the fetch. The body contains the user data and the ids of the products in his basket
// After posting the order the function collects the answer and the redirect the user on the confirmation page by precising in the URL the response
const answerMe = async (settings) => {
    let order = await fetch("http://localhost:3000/api/products/order", settings);
    let result = await order.json();
    localStorage.clear();
    window.location.href = "./confirmation.html?" + result.orderId;
}

// This bloc starts by selecting every inputs in the form
// Then it add an event on each of them
// Then there is a structure of control that is checking the id of the input
// For each case we call the proper function to analyze the value of the input
userFields.forEach((input) => {
    input.addEventListener("input", (e) => {
        switch (e.target.id) {
            case "firstName" :
                firstNameChecker(e.target.value);
                break;
            case "lastName" :
                lastNameChecker(e.target.value);
                break;
            case "address" :
                addressChecker(e.target.value);
                break;
            case "city" :
                cityChecker(e.target.value);
                break;
            case "email" :
                emailChecker(e.target.value);
                break;
            
        }
    })
})

// Here we add an event on the form the handle the submission of this one
// We start by preventing us from the default behavior of the form
// If all the variable related to fields are set we create three objects
// The first one, contact, contains all the user's data
// the second one, requestDesire, contains contact and an array with every id of the products in the basket
// The third one, postSettings, contains the settings for the POST method for when we want to submit the order. It put our second object in JSON format
// When those three objects have been set we can call the function that is going to actually make the promise and then redirects the user
// if the variable aren't properly set an alert says to the user that he must fill the fields
basketForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (firstName && lastName && address && city && email) {
        let contact = {
            firstName: firstName,
            lastName: lastName,
            address: address,
            city: city,
            email: email
        }
        let requestDesire = {
            contact: contact,
            products: products,
        }
        let postSettings = {
            method: 'POST',
            headers: {
                "Content-Type": "application/JSON",
            },
            body: JSON.stringify(requestDesire)
        }
        answerMe(postSettings);
    } else {
        alert("Les champs ne sont pas uniquement prévu pour les agriculteurs");
    }   
})






