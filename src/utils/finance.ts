export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date?: string;
    category?: string; // Novo campo
}

export const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário', 'Outros'
];

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Gera dados dinâmicos para o gráfico (apenas gastos do ano atual)
export const getMonthlyExpenses = (transactions: Transaction[]) => {
    const currentYear = new Date().getFullYear();
    const expenses = new Array(12).fill(0);

    transactions.forEach(t => {
        if (!t.date || t.type !== 'debit') return;
        const date = new Date(t.date);
        if (date.getFullYear() === currentYear) {
            expenses[date.getMonth()] += Math.abs(t.amount);
        }
    });

    return expenses;
};