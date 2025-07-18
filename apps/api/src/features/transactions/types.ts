// Transactions feature types
export interface Transaction {
    id: string;
    contactId: string;
    dealStage: string;
    amount: number;
}
