import readline from "readline";
import { foodItems } from "./data";
import { createGuest, createMember, getCustomerType } from "./customer";
import {
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateItemTotal,
    calculateSubtotal,
    searchFood
} from "./cart";
import { processPayment, getPaymentDetails } from "./payment";
import {
    calculateDiscount,
    calculateTax,
    calculateFinalAmount,
    generateBill
} from "./billing";
import { updateOrderStatus, getOrderStatusText } from "./order";
import {
    CartItem,
    CustomerType,
    Payment,
    OrderStatus,
    Bill
} from "./types";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

function showMenu(): void {
    console.log("\n========================================");
    console.log("       FOOD ORDERING SYSTEM");
    console.log("========================================");
    console.log("1. View Food Menu");
    console.log("2. Create Customer");
    console.log("3. Add Item to Cart");
    console.log("4. View Cart");
    console.log("5. Update Quantity");
    console.log("6. Remove Item");
    console.log("7. Search Food");
    console.log("8. Checkout");
    console.log("9. Change Order Status");
    console.log("10. Exit");
    console.log("========================================");
}

function showFoodMenu(): void {
    console.log("\n============== FOOD MENU ==============");

    foodItems.forEach(item => {
        const status = item.isAvailable ? "Available" : "Not Available";

        console.log(
            `${item.id}. ${item.name} - ₹${item.price} - ${status}`
        );
    });
}

function showCart(cart: CartItem[]): void {
    if (cart.length === 0) {
        console.log("\nCart is empty.");
        return;
    }

    console.log("\n================ CART ================");

    cart.forEach(item => {
        console.log(
            `${item.name} x${item.quantity} = ₹${calculateItemTotal(item).toFixed(2)}`
        );

        if (item.specialInstruction) {
            console.log(`Instruction: ${item.specialInstruction}`);
        }
    });

    console.log("---------------------------------------");
    console.log(`Subtotal: ₹${calculateSubtotal(cart).toFixed(2)}`);
}

async function createCustomer(): Promise<CustomerType> {
    const name = await ask("Enter customer name: ");
    const phone = await ask("Enter phone: ");
    const address = await ask("Enter address: ");

    console.log("\n1. Guest");
    console.log("2. Member");

    const type = await ask("Choose customer type: ");

    if (type === "2") {
        const membershipId = await ask("Enter membership ID: ");

        console.log("\n1. Silver - 5%");
        console.log("2. Gold - 10%");
        console.log("3. Platinum - 15%");

        const levelChoice = await ask("Choose membership level: ");

        let level: "silver" | "gold" | "platinum" = "silver";

        if (levelChoice === "2") {
            level = "gold";
        } else if (levelChoice === "3") {
            level = "platinum";
        }

        return createMember(
            1,
            name,
            phone,
            address,
            membershipId,
            level
        );
    }

    return createGuest(1, name, phone, address);
}

async function addItem(cart: CartItem[]): Promise<void> {
    showFoodMenu();

    const id = Number(await ask("\nEnter food ID: "));
    const quantity = Number(await ask("Enter quantity: "));

    const item = foodItems.find(food => food.id === id);

    if (!item) {
        console.log("Food item not found.");
        return;
    }

    if (!item.isAvailable) {
        console.log("This item is not available.");
        return;
    }

    if (quantity <= 0) {
        console.log("Quantity must be greater than 0.");
        return;
    }

    const instruction = await ask(
        "Enter special instruction (press Enter to skip): "
    );

    addToCart(cart, item, quantity, instruction || undefined);

    console.log(`${item.name} added to cart.`);
}

async function updateCartQuantity(cart: CartItem[]): Promise<void> {
    showCart(cart);

    if (cart.length === 0) {
        return;
    }

    const id = Number(await ask("\nEnter food ID: "));
    const quantity = Number(await ask("Enter new quantity: "));

    const item = cart.find(food => food.id === id);

    if (!item) {
        console.log("Item not found in cart.");
        return;
    }

    updateQuantity(cart, id, quantity);

    console.log("Quantity updated.");
}

async function removeItem(cart: CartItem[]): Promise<void> {
    showCart(cart);

    if (cart.length === 0) {
        return;
    }

    const id = Number(await ask("\nEnter food ID to remove: "));

    const item = cart.find(food => food.id === id);

    if (!item) {
        console.log("Item not found in cart.");
        return;
    }

    removeFromCart(cart, id);

    console.log("Item removed from cart.");
}

async function searchFoodItems(): Promise<void> {
    const text = await ask("\nEnter food name to search: ");

    const results = searchFood(foodItems, text);

    if (results.length === 0) {
        console.log("No food item found.");
        return;
    }

    console.log("\nSearch Results:");

    results.forEach(item => {
        console.log(
            `${item.name} - ${item.category} - ₹${item.price}`
        );
    });
}

function getFinalAmount(
    subtotal: number,
    customer: CustomerType
): number {
    const discount = calculateDiscount(subtotal, customer);
    const amountAfterDiscount = subtotal - discount.totalDiscount;
    const tax = calculateTax(amountAfterDiscount);

    return calculateFinalAmount(
        subtotal,
        discount.totalDiscount,
        tax
    );
}

async function choosePayment(amount: number): Promise<Payment | null> {
    console.log("\n============== PAYMENT ==============");
    console.log("1. Cash");
    console.log("2. Card");
    console.log("3. UPI");

    const choice = await ask("Choose payment method: ");

    if (choice === "1") {
        const receivedAmount = Number(
            await ask("Enter received amount: ₹")
        );

        const payment: Payment = {
            method: "cash",
            receivedAmount
        };

        if (!processPayment(payment, amount)) {
            console.log("Received amount is not enough.");
            return null;
        }

        return payment;
    }

    if (choice === "2") {
        const last4Digits = await ask(
            "Enter last 4 digits of card: "
        );

        if (!/^\d{4}$/.test(last4Digits)) {
            console.log("Enter exactly 4 digits.");
            return null;
        }

        const payment: Payment = {
            method: "card",
            last4Digits
        };

        if (!processPayment(payment, amount)) {
            console.log("Payment failed.");
            return null;
        }

        return payment;
    }

    if (choice === "3") {
        const transactionId = await ask("Enter transaction ID: ");

        if (!transactionId) {
            console.log("Transaction ID is required.");
            return null;
        }

        const payment: Payment = {
            method: "upi",
            transactionId
        };

        if (!processPayment(payment, amount)) {
            console.log("Payment failed.");
            return null;
        }

        return payment;
    }

    console.log("Invalid payment method.");
    return null;
}

function showBill(bill: Bill): void {
    const customerType = getCustomerType(bill.customer);

    console.log("\n========================================");
    console.log("             FINAL BILL");
    console.log("========================================");

    console.log(`Order ID: ${bill.orderId}`);
    console.log(`Customer: ${bill.customer.name}`);
    console.log(`Customer Type: ${customerType}`);

    console.log("\nItems:");

    bill.cartItems.forEach(item => {
        console.log(
            `${item.name} x${item.quantity} = ₹${calculateItemTotal(item).toFixed(2)}`
        );
    });

    console.log("----------------------------------------");
    console.log(`Subtotal: ₹${bill.subtotal.toFixed(2)}`);
    console.log(
        `Membership Discount: ₹${bill.membershipDiscount.toFixed(2)}`
    );
    console.log(
        `Additional Discount: ₹${bill.additionalDiscount.toFixed(2)}`
    );
    console.log(`GST (5%): ₹${bill.tax.toFixed(2)}`);
    console.log("----------------------------------------");
    console.log(`Final Amount: ₹${bill.finalAmount.toFixed(2)}`);
    console.log(`Payment: ${getPaymentDetails(bill.payment)}`);
    console.log("========================================");
    console.log("       THANK YOU FOR ORDERING!");
    console.log("========================================");
}

async function checkout(
    cart: CartItem[],
    customer: CustomerType | null
): Promise<Bill | null> {
    if (!customer) {
        console.log("Please create a customer first.");
        return null;
    }

    if (cart.length === 0) {
        console.log("Cart is empty.");
        return null;
    }

    const subtotal = calculateSubtotal(cart);
    const finalAmount = getFinalAmount(subtotal, customer);

    console.log(`\nSubtotal: ₹${subtotal.toFixed(2)}`);
    console.log(`Final Amount: ₹${finalAmount.toFixed(2)}`);

    const payment = await choosePayment(finalAmount);

    if (!payment) {
        return null;
    }

    const orderId = `ORD${Date.now()}`;
    const orderItems = [...cart];

    const result = generateBill(
        orderId,
        customer,
        orderItems,
        payment
    );

    if (result.status === "success") {
        showBill(result.bill);
        cart.length = 0;
        return result.bill;
    }

    console.log(result.message);
    return null;
}

async function changeStatus(
    currentStatus: OrderStatus
): Promise<OrderStatus> {
    console.log("\n============== ORDER STATUS ==============");
    console.log("1. Pending");
    console.log("2. Confirmed");
    console.log("3. Preparing");
    console.log("4. Delivered");
    console.log("5. Cancelled");

    const choice = await ask("Choose new status: ");

    let newStatus: OrderStatus = currentStatus;

    if (choice === "1") {
        newStatus = "pending";
    } else if (choice === "2") {
        newStatus = "confirmed";
    } else if (choice === "3") {
        newStatus = "preparing";
    } else if (choice === "4") {
        newStatus = "delivered";
    } else if (choice === "5") {
        newStatus = "cancelled";
    } else {
        console.log("Invalid status.");
        return currentStatus;
    }

    return updateOrderStatus(currentStatus, newStatus);
}

async function main(): Promise<void> {
    const cart: CartItem[] = [];
    let customer: CustomerType | null = null;
    let orderStatus: OrderStatus = "pending";
    let running = true;

    while (running) {
        showMenu();

        const choice = await ask("Select an option: ");

        switch (choice) {
            case "1":
                showFoodMenu();
                break;

            case "2":
                customer = await createCustomer();
                console.log(
                    `\nCustomer ${customer.name} created successfully.`
                );
                break;

            case "3":
                await addItem(cart);
                break;

            case "4":
                showCart(cart);
                break;

            case "5":
                await updateCartQuantity(cart);
                break;

            case "6":
                await removeItem(cart);
                break;

            case "7":
                await searchFoodItems();
                break;

            case "8": {
                const bill = await checkout(cart, customer);

                if (bill) {
                    orderStatus = "confirmed";
                    console.log(
                        `Order Status: ${getOrderStatusText(orderStatus)}`
                    );
                }

                break;
            }

            case "9":
                orderStatus = await changeStatus(orderStatus);
                console.log(
                    `Order Status: ${getOrderStatusText(orderStatus)}`
                );
                break;

            case "10":
                running = false;
                break;

            default:
                console.log("Invalid option.");
        }
    }

    rl.close();
    console.log("\nThank you. Goodbye!");
}

main();