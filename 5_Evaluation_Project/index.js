const API = (() => {
	const URL = "http://localhost:3000";

	const checkResponse = async (response) => {
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText);
		}
		return response.json();
	};

	const getCart = async () => {
		const response = await fetch(`${URL}/cart`);
		return checkResponse(response);
	};

	const getInventory = async () => {
		const response = await fetch(`${URL}/inventory`);
		return checkResponse(response);
	};

	const addToCart = async (inventoryItem) => {
		try {
      const response = await fetch(`${URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inventoryItem),
      });
      return checkResponse(response);
    } catch (error) {
      if (error.message.includes("duplicate id")) {
          console.error("Duplicate Id error:", error.message);
      } else {
          console.error("Failed adding item to cart:", error.message);
      }
      throw error;
    }
	};

	const updateCart = async (id, newAmount) => {
		const response = await fetch(`${URL}/cart/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: newAmount }),
		});
		return checkResponse(response);
	};

	const deleteFromCart = async (id) => {
		const response = await fetch(`${URL}/cart/${id}`, { method: "DELETE" });
		return checkResponse(response);
	};

	const checkout = async () => {
		const data = await getCart();
		return await Promise.all(data.map((item) => deleteFromCart(item.id)));
	};

	// returning api endpoints
	return {
		getCart,
		updateCart,
		getInventory,
		addToCart,
		deleteFromCart,
		checkout,
	};
})();

const Model = (() => {
	class State {
		// Private class variables
		#onChange;
		#inventory;
		#cart;
		// Class constructor
		constructor() {
			this.#inventory = [];
			this.#cart = [];
		}
		// Getters
		get cart() {
			return this.#cart;
		}
		get inventory() {
			return this.#inventory;
		}

		// Setters
		set cart(newCart) {
			this.#cart = newCart;
			this.#onChange();
		}
		set inventory(newInv) {
			this.#inventory = newInv;
			this.#onChange();
		}

		subscribe(cb) {
			this.#onChange = cb;
		}
	}

	const {
		getCart,
		updateCart,
		getInventory,
		addToCart,
		deleteFromCart,
		checkout,
	} = API;

	return {
		State,
		getCart,
		updateCart,
		getInventory,
		addToCart,
		deleteFromCart,
		checkout,
	};
})();

const View = (() => {
	// implement your logic for View
	const inventoryList = document.querySelector(".inventory-container ul");
	const cartList = document.querySelector(".cart-container ul");

	const renderInventory = (inventory) => {
		inventoryList.innerHTML = inventory
			.map(
				(item) =>
					`<li data-id="${item.id}">
        <span>${item.content}</span>
        <button class="subtract">-</button>
        <span class="amount">0</span>
        <button class="add">+</button>
        <button class="add-to-cart">Add to cart</button>
      </li>`
			)
			.join("");
	};

	const renderCart = (cart) => {
		cartList.innerHTML = cart
			.map(
				(item) =>
					`<li data-id="${item.id}">
        <span>${item.content}</span>
        <span class="amount">${item.amount}</span>
        <button class="delete">Delete</button>
      </li>`
			)
			.join("");
	};

	const updateAmount = (id, amount) => {
		const listItem = document.querySelector(
			`.inventory-container ul li[data-id="${id}"] .amount`
		);
		listItem.textContent = amount;
	};

	return {
		renderInventory,
		renderCart,
		updateAmount,
	};
})();

const Controller = ((model, view) => {
	// implement your logic for Controller
	const state = new model.State();

	const init = () => {
		model.getInventory().then((data) => (state.inventory = data));
		model.getCart().then((data) => (state.cart = data));
	};

	const handleUpdateAmount = (id, add) => {
		const amountElement = document.querySelector(
			`.inventory-container ul li[data-id="${id}"] .amount`
		);
		let amount = parseInt(amountElement.textContent);
		amount = add ? amount + 1 : amount - 1;
		amount = amount < 0 ? 0 : amount;
		view.updateAmount(id, amount);
	};

	const handleAddToCart = (id) => {
		const inventoryItem = state.inventory.find((item) => item.id === id);
    const amountElement = document.querySelector(
        `.inventory-container ul li[data-id="${id}"] .amount`
    );
    const amount = parseInt(amountElement.textContent);
    if (amount === 0) return;

    const cartItem = state.cart.find((item) => item.id === id);
    if (cartItem) {
        const updatedItem = { ...cartItem, amount: cartItem.amount + amount };
        model.updateCart(cartItem.id, updatedItem.amount)
            .then(() => {
                state.cart = state.cart.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                );
            })
            .catch(error => console.error("Failed to update cart:", error));
    } else {
        const newItem = { ...inventoryItem, amount };
        model.addToCart(newItem)
            .then((newCartItem) => {
                state.cart = [...state.cart, newCartItem];
            })
            .catch(error => console.error("Failed to add to cart:", error));
    }
	};
	const handleDelete = (id) => {
		model.deleteFromCart(id).then(() => {
			state.cart = state.cart.filter((item) => item.id !== id);
		});
	};

	const handleCheckout = () => {
		model.checkout().then(() => {
			state.cart = [];
		});
	};

	const bindEventListeners = () => {
		document
			.querySelector(".inventory-container ul")
			.addEventListener("click", (e) => {
				const id = parseInt(e.target.closest("li").dataset.id);
				if (e.target.classList.contains("subtract")) {
					handleUpdateAmount(id, false);
				} else if (e.target.classList.contains("add")) {
					handleUpdateAmount(id, true);
				} else if (e.target.classList.contains("add-to-cart")) {
					handleAddToCart(id);
				}
			});

		document
			.querySelector(".cart-container ul")
			.addEventListener("click", (e) => {
				const id = parseInt(e.target.closest("li").dataset.id);
				if (e.target.classList.contains("delete")) {
					handleDelete(id);
				}
			});

		document
			.querySelector(".checkout-btn")
			.addEventListener("click", handleCheckout);
	};

	const bootstrap = () => {
		state.subscribe(() => {
			view.renderInventory(state.inventory);
			view.renderCart(state.cart);
		});
		bindEventListeners();
		init();
	};

	return {
		bootstrap,
	};
})(Model, View);

Controller.bootstrap();
