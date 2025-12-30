export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date?: string;
    category?: string;
    isRecurring?: boolean;
    recurringId?: number;
}

export interface RecurringExpense {
    id: number;
    description: string;
    amount: number;
    category: string;
    day: number;
    lastGenerated?: string;
    type?: 'credit' | 'debit';
}

export interface FinanceConfig {
    salario: number;
    meta: number;
}

export const CATEGORIES = [
    'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário', 'Outros', 'Contas Fixas'
];

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const getMonthlyExpenses = (transactions: Transaction[], selectedYear: number) => {
    const expense = new Array(12).fill(0);
    const income = new Array(12).fill(0);

    transactions.forEach(t => {
        if (!t.date) return;
        
        const tDate = new Date(t.date);
        const year = tDate.getFullYear();
        const month = tDate.getMonth();
        
        if (year === selectedYear) {
            if (t.type === 'debit') {
                expense[month] += Math.abs(t.amount);
            } else if (t.type === 'credit') {
                income[month] += t.amount;
            }
        }
    });

    return { income, expense };
};

export const calculateAnnualMetrics = (transactions: Transaction[], salarioConfigurado: number, selectedYear: number) => {
    const now = new Date();
    const currentRealYear = now.getFullYear();
    
    let mesesConsiderados = 12;

    if (selectedYear === currentRealYear) {
        mesesConsiderados = now.getMonth() + 1;
    } else if (selectedYear > currentRealYear) {
        mesesConsiderados = 12;
    }

    const gastosDoAno = transactions
        .filter(t => {
            if (!t.date) return false;
            const tDate = new Date(t.date);
            return t.type === 'debit' && tDate.getFullYear() === selectedYear;
        })
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const mediaMensalGastos = gastosDoAno / mesesConsiderados;
    const projecaoGastos = mediaMensalGastos * 12;

    const entradasDoAno = transactions
        .filter(t => {
            if (!t.date) return false;
            const tDate = new Date(t.date);
            return t.type === 'credit' && tDate.getFullYear() === selectedYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const mediaMensalEntradas = (entradasDoAno + (salarioConfigurado * mesesConsiderados)) / mesesConsiderados;
    
    const rendaAnualEstimada = entradasDoAno > 0 
        ? mediaMensalEntradas * 12 
        : salarioConfigurado * 12;

    const saldoAnualProjetado = rendaAnualEstimada - projecaoGastos;
    
    const percentualComprometido = rendaAnualEstimada > 0 
        ? (projecaoGastos / rendaAnualEstimada) * 100 
        : 0;

    return {
        gastosDoAno,
        projecaoGastos,
        rendaAnual: rendaAnualEstimada,
        saldoAnualProjetado,
        percentualComprometido: Math.min(percentualComprometido, 100)
    };
};

export const processRecurringExpenses = (
    transactions: Transaction[], 
    recurringExpenses: RecurringExpense[],
    filterMonth: number,
    filterYear: number
): { updatedTransactions: Transaction[], updatedRecurring: RecurringExpense[], newCount: number } => {
    
    const now = new Date();
    const currentRealYear = now.getFullYear();
    const limitYear = Math.max(currentRealYear, filterYear);
    const cutoffDate = new Date(limitYear, 11, 28, 23, 59, 59);

    let newTransactions: Transaction[] = [];
    let updatedRecurring = [...recurringExpenses];
    
    updatedRecurring = updatedRecurring.map(expense => {
        const expenseType = expense.type || 'debit';
        
        let startMonth: number;
        let startYear: number;

        if (!expense.lastGenerated) {
            startMonth = filterMonth;
            startYear = filterYear;
        } else {
            const lastDate = new Date(expense.lastGenerated);
            startMonth = lastDate.getMonth() + 1;
            startYear = lastDate.getFullYear();
            
            if (startMonth > 11) {
                startMonth = 0;
                startYear++;
            }
        }

        let pointerDate = new Date(startYear, startMonth, 1, 12, 0, 0);

        let generatedForThisExpense = false;
        let lastGenDateStr = expense.lastGenerated;

        while (pointerDate <= cutoffDate) {
             const m = pointerDate.getMonth();
             const y = pointerDate.getFullYear();
             
             const transactionDate = new Date(y, m, expense.day, 12, 0, 0);
             const amountVal = Math.abs(expense.amount);

             newTransactions.push({
                id: Date.now() + Math.random(),
                description: expense.description,
                amount: expenseType === 'credit' ? amountVal : -amountVal,
                type: expenseType,
                category: expense.category,
                date: transactionDate.toISOString(),
                isRecurring: true,
                recurringId: expense.id
            });

            lastGenDateStr = transactionDate.toISOString();
            generatedForThisExpense = true;

            pointerDate.setMonth(pointerDate.getMonth() + 1);
        }

        if (generatedForThisExpense) {
            return { ...expense, lastGenerated: lastGenDateStr };
        }

        return expense;
    });

    return {
        updatedTransactions: [...transactions, ...newTransactions],
        updatedRecurring,
        newCount: newTransactions.length
    };
};