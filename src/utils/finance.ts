export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date?: string;
    category?: string;
}

export interface FinanceConfig {
    salario: number;
    meta: number;
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

export const getMonthlyExpenses = (transactions: Transaction[]) => {
    const currentYear = new Date().getFullYear();
    const expenses = new Array(12).fill(0);

    transactions.forEach(t => {
        if (!t.date || t.type !== 'debit') return;
        const [year, month] = t.date.split('T')[0].split('-').map(Number);
        
        if (year === currentYear) {
            expenses[month - 1] += Math.abs(t.amount);
        }
    });

    return expenses;
};

export const calculateAnnualMetrics = (transactions: Transaction[], salarioConfigurado: number) => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    const mesesConsiderados = currentMonthIndex + 1;

    const gastosDoAno = transactions
        .filter(t => {
            if (!t.date) return false;
            const tDate = new Date(t.date);
            return t.type === 'debit' && tDate.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const mediaMensalGastos = gastosDoAno / mesesConsiderados;
    const projecaoGastos = mediaMensalGastos * 12;

    const entradasDoAno = transactions
        .filter(t => {
            if (!t.date) return false;
            const tDate = new Date(t.date);
            return t.type === 'credit' && tDate.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const mediaMensalEntradas = entradasDoAno / mesesConsiderados;
    
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