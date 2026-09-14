import { Payment } from "./types";

export function processPayment(
    payment: Payment,
    amount: number
): boolean {
    if (payment.method === "cash") {
        return payment.receivedAmount >= amount;
    }

    if ("last4Digits" in payment) {
        return payment.last4Digits.length === 4;
    }

    if ("transactionId" in payment) {
        return payment.transactionId.length > 0;
    }

    return false;
}

export function getPaymentDetails(payment: Payment): string {
    switch (payment.method) {
        case "cash":
            return `Cash - Received: ₹${payment.receivedAmount.toFixed(2)}`;

        case "card":
            return `Card - ****${payment.last4Digits}`;

        case "upi":
            return `UPI - ${payment.transactionId}`;

        default:
            return assertNever(payment);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled payment method: ${value}`);
}