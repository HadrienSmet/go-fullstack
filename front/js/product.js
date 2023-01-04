const imgContainer = document.querySelector(".item__img");
const productTitle = document.querySelector("#title");
const productPrice = document.querySelector("#price");
const productDetails = document.querySelector("#description");
const productColors = document.querySelector("#colors");
const productQuantity = document.querySelector("#quantity");
const button = document.getElementById("addToCart");
let productInfos = [];
let urlId;
let quantity;

// This function analyse the URL to get back the product's ID to set it into a variable
const whereAreWe = () => {
    let urlData = window.location.search;
    urlId = urlData.split("=")[1];
}

// This function make a promise to the API thanks to the id we just collected to get all the data about a product
// Then we transform the response in JSON into a JS object
// Then we put this object into a variable
const fetchProductData = async () => {
    await fetch("http://localhost:3000/api/products/" + urlId)
        .then((res) => res.json())
        .then((data) => productInfos = data)    
}

// This function displays all the data we collected into the DOM
const displayProductData = () => {
    imgContainer.innerHTML = `
        <img src=${productInfos.imageUrl} alt="Photographie du ${productInfos.name}">
    `
    productTitle.textContent = productInfos.name;
    productPrice.textContent = productInfos.price;
    productDetails.textContent = productInfos.description;
    productColors.innerHTML += `
        <option value=${productInfos.colors[0]}>${productInfos.colors[0]}</option>
        <option value=${productInfos.colors[1]}>${productInfos.colors[1]}</option>
    `
}

// This function put a new object called basket in the localStorage it turns into a JSON format
// @params {type: Object} --> represents the product we put into the basket
const setBasket = (basket) => {
    localStorage.setItem("basket", JSON.stringify(basket));
}

// This function get the element called basket in the localStorage
// If the basket is not present --> it returns an empty array
// If it finds the basket it turns it into a JS object before retunring it to us
const getBasket = () => {
    let basket = localStorage.getItem("basket");
    if (basket == null) {
        return [];
    } else {
        return JSON.parse(basket);
    }
}

// This function handles how the products are pushed into the basket
// It gets back what contains the localStorage and sets two others variables :
// The first one checks if the id of the products we want to push is already in the basket
// It can retruns us either the element if it finds it or 'undefined' if it doesn't
// The second one checks if the color of the product we want to push is already in the basket
// If those two variables aren't on undefined it means that the product is already in the basket 
//and so instead of pushing we increase the quantity of the element present in the basket
// Else we simply push the product
// And anyway we set the new basket in the localStorage
const storingData = () => {
    let basket = getBasket();
    let isInTheBasket = basket.find(p => p.id == urlId);
    let alreadyGotThatColor = basket.find(p => p.color == productColors.options[productColors.selectedIndex].value)
    if (isInTheBasket != undefined && alreadyGotThatColor != undefined) {
        isInTheBasket.quantity = parseInt(isInTheBasket.quantity) + parseInt(quantity);
    } else {
        basket.push({
            id: urlId,
            name: productInfos.name,
            image: productInfos.imageUrl,
            quantity: quantity,
            color: productColors.options[productColors.selectedIndex].value,
            datasetid: urlId + "/" + productColors.options[productColors.selectedIndex].value
        })
    }
    setBasket(basket);
}

// This is the main function to handle the page
// It starts to collect the id
// Then it gets the data before displaying it
const main = async () => {
    whereAreWe();
    await fetchProductData();
    displayProductData();
}

// Adding an event on the input referrencing the quantity to be able switch the value in the variable when the user touch the input
productQuantity.addEventListener("input", (e) => {
    quantity = e.target.value;
})

// Adding an event on the the button to be able to store the data
// Starting by preventing the default behavior
// If a quantity and a color are defined we store the data
// Else an alert warns the user that he must do it before submit anything
button.addEventListener("click",(e) => {
    e.preventDefault();
    if (productQuantity.value >= 1 && productColors.options[productColors.selectedIndex].value != "") {
        storingData();
    } else {
        window.alert("Veuillez définir une couleur et une quantité avant de remplir votre panier")
    }
})

main();