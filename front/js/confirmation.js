const orderIdConstainer = document.querySelector("#orderId");
let orderId;

// This function put the parameter of the page into a variable
// This param represents the order ID
const getOrderId = () => {
    let urlData = window.location.search;
    orderId = urlData.split("?")[1];

}

// This function calls another to collect the order ID and then it displays it in the right place on the DOM
const displayId = () => {
    getOrderId();
    orderIdConstainer.textContent = orderId;
}

displayId();