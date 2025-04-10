export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

export interface Property {
    id: string;
    name: string;
    address: string;
    createdAt: Date;
    createdBy: string; // User ID
}

export interface Expense {
    id: string;
    propertyId: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    createdBy: string; // User ID
    receiptUrl?: string;
}

export interface PropertyMember {
    id: string;
    propertyId: string;
    userId: string;
    role: 'owner' | 'tenant' | 'manager';
    joinedAt: Date;
}
