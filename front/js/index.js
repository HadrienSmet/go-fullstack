const kanapContainer = document.querySelector("#items");
let ourProducts = [];

// This function makes a call to the API to get all the data it contains
// It turns the JSON into a JS object then it sets the object into an array
const fetchThoseKanaps = async () => {
    await fetch("http://localhost:3000/api/products")
        .then((res) => res.json())
        .then((data) => ourProducts = data)
        .catch((err) => console.log("something screwed up..." + err));
        
}

// This function displays all the data got from the API
// We inject HTML divisions for each element found in the array
const kanapDisplayer = () => {
    kanapContainer.innerHTML = 
        ourProducts.map((product) => {
            return `
                <a href="./product.html?id=${product._id}">
                    <article>
                        <img src=${product.imageUrl} alt=photo de ${product.name}>
                        <h3 class="productName">${product.name}</h3>
                        <p class="productDescription">${product.description}</p>
                    </article>
                </a>
            `;
        })
        .join("");
}

// This is the main function to handle the page
// It starts by collecting the data and then it displays it properly
const main = async () => {
    await fetchThoseKanaps();
    kanapDisplayer();
}
main();