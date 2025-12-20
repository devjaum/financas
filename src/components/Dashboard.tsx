import React, { useEffect, useState, useRef, useMemo } from "react";
import '../styles/components/Dashboard.css';
import AddTransaction from './AddTransaction.tsx';
import { Chart, registerables } from 'chart.js';
import { Transaction, formatCurrency, getMonthlyExpenses, CATEGORIES } from '../utils/finance.ts';
import { useTheme } from '../contexts/ThemeContext.tsx'

Chart.register(...registerables);

function Dashboard() {
    const { theme, toggleTheme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const chartRef = useRef<Chart | null>(null);

    const [filterMonth, setFilterMonth] = useState<string>(String(new Date().getMonth()));
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

    const loadData = () => {
        const savedTransactions = localStorage.getItem('transactions');
        const transactionsList = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        const sanitizedList = transactionsList.map((t: any) => ({
            ...t,
            date: t.date || new Date().toISOString(),
            category: t.category || 'Outros'
        }));

        setTransactions(sanitizedList);
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredTransactions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return transactions.filter(t => {
            const tDate = new Date(t.date!);
            const sameMonth = tDate.getMonth() === parseInt(filterMonth);
            const sameYear = tDate.getFullYear() === currentYear;
            const matchType = filterType === 'all' || t.type === filterType;
            
            return sameMonth && sameYear && matchType;
        });
    }, [transactions, filterMonth, filterType]);

    useEffect(() => {
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (ctx) {
            if (chartRef.current) chartRef.current.destroy();
            
            const monthlyData = getMonthlyExpenses(transactions);
            
            const textColor = theme === 'dark' ? '#e2e8f0' : '#2c3e50';
            const gridColor = theme === 'dark' ? '#334155' : '#e1e4e8';

            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [{
                        label: 'Gastos do Ano (R$)',
                        data: monthlyData,
                        backgroundColor: 'rgba(39, 174, 96, 0.5)',
                        borderColor: '#27ae60',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            ticks: { color: textColor },
                            grid: { color: gridColor }
                        },
                        x: {
                            ticks: { color: textColor },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: textColor } }
                    }
                }
            });
        }
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [transactions, theme]); 
    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir?")) {
            const updated = transactions.filter(t => t.id !== id);
            setTransactions(updated);
            localStorage.setItem('transactions', JSON.stringify(updated));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const renderResumoMensal = () => {
        const entradas = filteredTransactions
            .filter(t => t.type === 'credit')
            .reduce((acc, t) => acc + t.amount, 0);

        const saidas = filteredTransactions
            .filter(t => t.type === 'debit')
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        const saldo = entradas - saidas;

        return (
            <div className="resumo-grid">
                <div className="card-info" style={{ borderLeft: '4px solid #27ae60' }}>
                    <span>Entradas</span>
                    <strong style={{ color: '#27ae60' }}>{formatCurrency(entradas)}</strong>
                </div>
                <div className="card-info" style={{ borderLeft: '4px solid #c0392b' }}>
                    <span>Saídas</span>
                    <strong style={{ color: '#c0392b' }}>{formatCurrency(saidas)}</strong>
                </div>
                <div className="card-info" style={{ borderLeft: `4px solid ${saldo >= 0 ? '#27ae60' : '#c0392b'}` }}>
                    <span>Saldo</span>
                    <strong style={{ color: saldo >= 0 ? '#27ae5fbd' : '#c03a2bbe' }}>{formatCurrency(saldo)}</strong>
                </div>
            </div>
        );
    };

    return (
        <main>
            <section className="header-section">
                <h3>Visão Geral</h3>
                <button onClick={toggleTheme} className="theme-toggle-btn" title="Mudar Tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <div className="filters">
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                        <option value="all">Todos</option>
                        <option value="credit">Entradas</option>
                        <option value="debit">Saídas</option>
                    </select>
                </div>
            </section>

            <section>
                {renderResumoMensal()}
            </section>

            <section className="transactions-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Transações ({filteredTransactions.length})</h3>
                    <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Nova</button>
                </div>

                <ul className="transaction-list">
                    {filteredTransactions.slice().reverse().map(t => (
                        <li key={t.id} className={t.type}>
                            <div className="trans-info">
                                <span className="trans-desc">{t.description}</span>
                                <span className="trans-cat">{t.category}</span>
                            </div>
                            <div className="trans-right">
                                <span>{formatCurrency(t.amount)}</span>
                                <button onClick={() => handleEdit(t)} className="btn-icon">✏️</button>
                                <button onClick={() => handleDelete(t.id)} className="btn-icon delete">🗑️</button>
                            </div>
                        </li>
                    ))}
                    {filteredTransactions.length === 0 && <li className="empty-state">Nenhuma transação encontrada neste período.</li>}
                </ul>
            </section>

            <section className="chart-section">
                <h3>Gráfico Anual de Gastos</h3>
                <div className="chart-container">
                    <canvas id="myChart"></canvas>
                </div>
            </section>

            {isModalOpen && (
                <AddTransaction 
                    onClose={handleCloseModal} 
                    onTransactionAdded={loadData}
                    transactionToEdit={editingTransaction}
                />
            )}
        </main>
    );
}

export default Dashboard;