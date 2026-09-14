import { CustomerType, Guest, Member } from "./types";

export function createGuest(
    id: number,
    name: string,
    phone: string,
    address: string
): Guest {
    return {
        id,
        name,
        phone: phone || undefined,
        address
    };
}

export function createMember(
    id: number,
    name: string,
    phone: string,
    address: string,
    membershipId: string,
    membershipLevel: "silver" | "gold" | "platinum"
): Member {
    let discountPercentage = 5;

    if (membershipLevel === "gold") {
        discountPercentage = 10;
    } else if (membershipLevel === "platinum") {
        discountPercentage = 15;
    }

    return {
        id,
        name,
        phone: phone || undefined,
        address,
        membershipId,
        discountPercentage,
        membershipLevel
    };
}

export function getCustomerType(customer: CustomerType): string {
    if ("membershipId" in customer) {
        return `${customer.membershipLevel} Member`;
    }

    return "Guest";
}