import { CartItem, FoodItem } from "./types";

export function addToCart(
    cart: CartItem[],
    foodItem: FoodItem,
    quantity: number,
    specialInstruction?: string
): CartItem[] {
    if (quantity <= 0) {
        return cart;
    }

    const existingItem = cart.find(item => item.id === foodItem.id);

    if (existingItem) {
        existingItem.quantity += quantity;

        if (specialInstruction) {
            existingItem.specialInstruction = specialInstruction;
        }

        return cart;
    }

    const newItem: CartItem = {
        ...foodItem,
        quantity,
        specialInstruction
    };

    cart.push(newItem);

    return cart;
}

export function removeFromCart(
    cart: CartItem[],
    foodId: number
): CartItem[] {
    const index = cart.findIndex(item => item.id === foodId);

    if (index !== -1) {
        cart.splice(index, 1);
    }

    return cart;
}

export function updateQuantity(
    cart: CartItem[],
    foodId: number,
    quantity: number
): CartItem[] {
    const item = cart.find(item => item.id === foodId);

    if (item) {
        if (quantity <= 0) {
            return removeFromCart(cart, foodId);
        }

        item.quantity = quantity;
    }

    return cart;
}

export function calculateItemTotal(item: CartItem): number {
    return item.price * item.quantity;
}

export function calculateSubtotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => {
        return total + calculateItemTotal(item);
    }, 0);
}

export function searchFood(
    foodItems: FoodItem[],
    searchText: string
): FoodItem[] {
    return foodItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );
}