import { OrderStatus } from "./types";

export function updateOrderStatus(
    status: OrderStatus,
    newStatus: OrderStatus
): OrderStatus {
    switch (newStatus) {
        case "pending":
            return "pending";

        case "confirmed":
            return "confirmed";

        case "preparing":
            return "preparing";

        case "delivered":
            return "delivered";

        case "cancelled":
            return "cancelled";

        default:
            return assertNever(newStatus);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled order status: ${value}`);
}

export function getOrderStatusText(status: OrderStatus): string {
    switch (status) {
        case "pending":
            return "Pending";

        case "confirmed":
            return "Confirmed";

        case "preparing":
            return "Preparing";

        case "delivered":
            return "Delivered";

        case "cancelled":
            return "Cancelled";

        default:
            return assertNever(status);
    }
}