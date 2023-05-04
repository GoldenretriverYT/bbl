// ==UserScript==
// @name         BetterBlockLands Reblocked
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Better Block Lands 4.0 is for the new Block Lands
// @author       GoldenretriverYT
// @match        *://*.block-lands.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=block-lands.com
// @grant        none
// @updateURL    https://github.com/GoldenretriverYT/bbl/blob/main/bbl.user.js
// ==/UserScript==

class GenericPatch {
    name = "";
    description = "";

    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    apply() {
        console.log("Applying patch: " + this.name + " - " + this.description);
    }

    shouldApply() {
        return true;
    }
}

class StrictURLPatch extends GenericPatch {
    url = "";
    apply = () => {};

    constructor(name, description, url, apply) {
        super(name, description);
        this.url = url;
        this.apply = apply;
    }

    shouldApply() {
        return window.location.pathname == this.url;
    }

    apply() {
        super.apply();
        this.apply();
    }
}

var patches = [
    new StrictURLPatch("Shop CSS & JS Injection", "Injects CSS & JS into the shop", "/shop.php", () => {
        var style = document.createElement("style");
        style.innerHTML = `
        .shop {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .row {
            display: flex;
            flex-direction: row;
            align-items: center;
        }

        .card {
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1px solid black;
            border-radius: 5px;
            padding: 10px;
            margin: 10px;
            width: 200px;
        }`;

        document.head.appendChild(style);
    }),
    new StrictURLPatch("Shop Improvements", "Applies various CSS improvements", "/shop.php", () => {
        // get h3s (item names) from body
        var h3s = document.getElementsByTagName("h3");

        var items = [];
        // loop through h3s
        for (var i = 0; i < h3s.length; i++) {
            items.push({
                name: h3s[i].innerText,
                price: h3s[i].nextElementSibling.textContent,
                preview: h3s[i].nextElementSibling.nextElementSibling.nextElementSibling,
                itemId: h3s[i].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.children[0].value
            });
        }

        // Since the items can have extra elements, we will remove everything except the navbar from the body
        document.body.innerHTML = document.getElementsByClassName("topnav")[0].outerHTML;

        // Create a new div for the shop
        var shop = document.createElement("div");
        shop.className = "shop";

        // Create a new heading using the Arial font
        var heading = document.createElement("h1");
        heading.style.fontFamily = "Arial";
        heading.innerText = "Shop";

        // Append the heading to the shop
        shop.appendChild(heading);

        // Add link to makeitem.php
        var makeItem = document.createElement("a");
        makeItem.href = "/makeitem.php";
        makeItem.innerText = "Make your own item";
        makeItem.style.margin = "10px";
        makeItem.style.fontFamily = "Arial";
        shop.appendChild(makeItem);

        var row = document.createElement("div");
        row.className = "row";

        // Create cards for each item
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var el = document.createElement("div");
            el.className = "card";

            var name = document.createElement("h3");
            name.innerText = item.name;

            var price = document.createElement("p");
            price.innerText = item.price;

            var preview = document.createElement("img");
            preview.src = item.preview.src;
            preview.style.width = "100px";
            preview.style.height = "auto";

            el.appendChild(name);
            el.appendChild(price);
            el.appendChild(preview);

            // Add the buy button
            var buy = document.createElement("button");
            buy.innerText = "Buy";
            buy.onclick = () => {
                fetch("/shop.php", {
                    method: "POST",
                    body: "item=" + item.itemId,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include"
                }).then(res => res.text()).then(res => {
                    window.location.reload();
                });
            };

            el.appendChild(buy);

            row.appendChild(el);

            if(row.childElementCount == Math.floor(window.innerWidth / 250)) {
                shop.appendChild(row);
                row = document.createElement("div");
                row.className = "row";
            }
        }

        // Append the last row to the shop
        shop.appendChild(row);

        // Append the shop to the body
        document.body.appendChild(shop);
    })
];

(function() {
    // Apply patches
    for (var i = 0; i < patches.length; i++) {
        var patch = patches[i];

        if (patch.shouldApply()) {
            patch.apply();
        }
    }
})();
