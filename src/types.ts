export type FoodCategory = "pizza" | "burger" | "drink" | "dessert";

export interface FoodItem {
    id: number;
    name: string;
    category: FoodCategory;
    price: number;
    isAvailable: boolean;
}

export interface Customer {
    id: number;
    name: string;
    phone?: string;
    address: string;
}

export type Guest = Customer;

export interface Member extends Customer {
    membershipId: string;
    discountPercentage: number;
    membershipLevel: "silver" | "gold" | "platinum";
}

export type CustomerType = Guest | Member;

export type OrderInfo = {
    quantity: number;
    specialInstruction?: string;
};

export type CartItem = FoodItem & OrderInfo;

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "delivered"
    | "cancelled";

export interface CashPayment {
    method: "cash";
    receivedAmount: number;
}

export interface CardPayment {
    method: "card";
    last4Digits: string;
}

export interface UpiPayment {
    method: "upi";
    transactionId: string;
}

export type Payment = CashPayment | CardPayment | UpiPayment;

export interface Bill {
    orderId: string;
    customer: CustomerType;
    cartItems: CartItem[];
    subtotal: number;
    membershipDiscount: number;
    additionalDiscount: number;
    totalDiscount: number;
    tax: number;
    finalAmount: number;
    payment: Payment;
}

export type BillResult =
    | {
          status: "success";
          bill: Bill;
      }
    | {
          status: "error";
          message: string;
      };