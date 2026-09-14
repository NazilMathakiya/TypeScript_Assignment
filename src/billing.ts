import {
    Bill,
    BillResult,
    CartItem,
    CustomerType,
    Payment
} from "./types";
import { calculateSubtotal } from "./cart";

export function calculateDiscount(
    subtotal: number,
    customer: CustomerType
): {
    membershipDiscount: number;
    additionalDiscount: number;
    totalDiscount: number;
} {
    let membershipDiscount = 0;

    if ("discountPercentage" in customer) {
        membershipDiscount =
            subtotal * customer.discountPercentage / 100;
    }

    const amountAfterMembership = subtotal - membershipDiscount;

    let additionalDiscount = 0;

    if (subtotal > 2000) {
        additionalDiscount = amountAfterMembership * 5 / 100;
    }

    const totalDiscount = membershipDiscount + additionalDiscount;

    return {
        membershipDiscount,
        additionalDiscount,
        totalDiscount
    };
}

export function calculateTax(amount: number): number {
    return amount * 5 / 100;
}

export function calculateFinalAmount(
    subtotal: number,
    totalDiscount: number,
    tax: number
): number {
    return subtotal - totalDiscount + tax;
}

export function generateBill(
    orderId: string,
    customer: CustomerType,
    cartItems: CartItem[],
    payment: Payment
): BillResult {
    if (cartItems.length === 0) {
        return {
            status: "error",
            message: "Cart is empty."
        };
    }

    const subtotal = calculateSubtotal(cartItems);

    const discount = calculateDiscount(subtotal, customer);

    const amountAfterDiscount = subtotal - discount.totalDiscount;

    const tax = calculateTax(amountAfterDiscount);

    const finalAmount = calculateFinalAmount(
        subtotal,
        discount.totalDiscount,
        tax
    );

    const bill: Bill = {
        orderId,
        customer,
        cartItems,
        subtotal,
        membershipDiscount: discount.membershipDiscount,
        additionalDiscount: discount.additionalDiscount,
        totalDiscount: discount.totalDiscount,
        tax,
        finalAmount,
        payment
    };

    return {
        status: "success",
        bill
    };
}