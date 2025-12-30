import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import '../styles/components/Dashboard.css';
import AddTransaction from './AddTransaction.tsx';
import RecurringExpenses from './RecurringExpenses.tsx'; 
import { Chart, registerables } from 'chart.js';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { 
    Transaction, 
    formatCurrency, 
    getMonthlyExpenses, 
    calculateAnnualMetrics, 
    processRecurringExpenses, 
    FinanceConfig,
    RecurringExpense 
} from '../utils/finance.ts';

Chart.register(...registerables);

function Dashboard() {
    const { theme, toggleTheme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [config, setConfig] = useState<FinanceConfig>({ salario: 0, meta: 0 });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const chartRef = useRef<Chart | null>(null);

    const currentYearNum = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState<string>(String(currentYearNum));
    const [filterMonth, setFilterMonth] = useState<string>(String(new Date().getMonth()));
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

    const availableYears = useMemo(() => {
        const years = new Set([currentYearNum, currentYearNum + 1]); 
        transactions.forEach(t => {
            if (t.date) {
                const y = new Date(t.date).getFullYear();
                years.add(y);
            }
        });
        return Array.from(years).sort((a, b) => a - b);
    }, [transactions, currentYearNum]);

    const loadData = useCallback(() => {
        const savedTransactions = localStorage.getItem('transactions');
        let transactionsList: Transaction[] = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        const savedConfig = localStorage.getItem('finance_config');
        if (savedConfig) setConfig(JSON.parse(savedConfig));
        
        const savedRecurring = localStorage.getItem('recurring_expenses');
        if (savedRecurring) {
            const recurringList: RecurringExpense[] = JSON.parse(savedRecurring);
            const selectedMonthIndex = parseInt(filterMonth);
            const selectedYearInt = parseInt(filterYear); 
            
            const result = processRecurringExpenses(
                transactionsList, 
                recurringList, 
                selectedMonthIndex,
                selectedYearInt
            );
            
            if (result.newCount > 0) {
                transactionsList = result.updatedTransactions;
                localStorage.setItem('transactions', JSON.stringify(transactionsList));
                localStorage.setItem('recurring_expenses', JSON.stringify(result.updatedRecurring));
            }
        }

        const sanitizedList = transactionsList.map((t: any) => ({
            ...t,
            date: t.date || new Date().toISOString(),
            category: t.category || 'Outros'
        }));

        setTransactions(sanitizedList);
    }, [filterMonth, filterYear]); 

    useEffect(() => {
        loadData();
    }, [loadData]); 

    const handleEditSalary = () => {
        const newSalary = window.prompt("Digite seu salário mensal líquido (base):", config.salario.toString());
        if (newSalary && !isNaN(parseFloat(newSalary))) {
            //Fazer o lançamento em todos os meses daquele ano
            const updatedConfig = { ...config, salario: parseFloat(newSalary) };
            setConfig(updatedConfig);
            localStorage.setItem('finance_config', JSON.stringify(updatedConfig));
            
        }
    };

    const filteredTransactions = useMemo(() => {
        const yearToFilter = parseInt(filterYear);
        return transactions.filter(t => {
            const tDate = new Date(t.date!);
            const sameMonth = tDate.getMonth() === parseInt(filterMonth);
            const sameYear = tDate.getFullYear() === yearToFilter;
            const matchType = filterType === 'all' || t.type === filterType;
            return sameMonth && sameYear && matchType;
        });
    }, [transactions, filterMonth, filterType, filterYear]);

    useEffect(() => {
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (ctx) {
            if (chartRef.current) chartRef.current.destroy();
            
            const { income, expense } = getMonthlyExpenses(transactions, parseInt(filterYear));
            
            const textColor = theme === 'dark' ? '#e2e8f0' : '#2c3e50';
            const gridColor = theme === 'dark' ? '#334155' : '#e1e4e8';

            const createColors = (baseColor: string, highlightColor: string) => {
                return income.map((_, index) => {
                    return index === parseInt(filterMonth) ? highlightColor : baseColor;
                });
            };

            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [
                        {
                            label: `Entradas`,
                            data: income,
                            backgroundColor: createColors('rgba(39, 174, 96, 0.2)', 'rgba(39, 174, 96, 0.8)'),
                            borderColor: '#27ae60',
                            borderWidth: 1,
                            borderRadius: 4
                        },
                        {
                            label: `Saídas`,
                            data: expense,
                            backgroundColor: createColors('rgba(192, 57, 43, 0.2)', 'rgba(192, 57, 43, 0.8)'),
                            borderColor: '#c0392b',
                            borderWidth: 1,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { display: false } }
                    },
                    plugins: { legend: { labels: { color: textColor } } },
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const firstPoint = elements[0];
                            const monthIndex = firstPoint.index;
                            setFilterMonth(String(monthIndex));
                        }
                    }
                }
            });
        }
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [transactions, theme, filterYear, filterMonth]); 

    const renderAnnualReport = () => {
        const metrics = calculateAnnualMetrics(transactions, config.salario, parseInt(filterYear));
        
        let statusColor = "var(--success)";
        let mensagem = "🚀 Finanças saudáveis! Mantenha o foco.";

        if (metrics.saldoAnualProjetado < 0) {
            statusColor = "var(--danger)";
            mensagem = "🚨 Perigo! Seus gastos projetados superam sua renda anual.";
        } else if (metrics.percentualComprometido > 80) {
            statusColor = "var(--warning)";
            mensagem = "⚠️ Atenção! Você está vivendo no limite do orçamento.";
        }

        return (
            <div className="annual-report-container">
                <div className="report-header">
                    <h4>Saúde Financeira ({filterYear})</h4>
                    <button onClick={handleEditSalary} className="btn-small-outline">Alterar Salário Base</button>
                </div>
                
                <div className="progress-area">
                    <div className="progress-labels">
                        <span>Comprometimento da Renda</span>
                        <strong>{metrics.percentualComprometido.toFixed(1)}%</strong>
                    </div>
                    <div className="progress-bar-bg">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${metrics.percentualComprometido}%`, backgroundColor: statusColor }}
                        ></div>
                    </div>
                </div>

                <div className="resumo-grid">
                    <div className="card-info">
                        <span>Renda Anual (Est.)</span>
                        <strong style={{ color: 'var(--success)' }}>{formatCurrency(metrics.rendaAnual)}</strong>
                    </div>
                    <div className="card-info">
                        <span>Gasto Projetado</span>
                        <strong style={{ color: 'var(--danger)' }}>{formatCurrency(metrics.projecaoGastos)}</strong>
                    </div>
                    <div className="card-info">
                        <span>Saldo Projetado</span>
                        <strong style={{ color: metrics.saldoAnualProjetado >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                            {formatCurrency(metrics.saldoAnualProjetado)}
                        </strong>
                    </div>
                </div>

                <div className="mensagem-final" style={{ borderLeftColor: statusColor, color: statusColor }}>
                    {mensagem}
                </div>
            </div>
        );
    };

    const handleEdit = (t: Transaction) => { setEditingTransaction(t); setIsModalOpen(true); };
    const handleDelete = (id: number) => { 
        if(window.confirm("Excluir transação?")) {
            const updated = transactions.filter(t => t.id !== id);
            setTransactions(updated);
            localStorage.setItem('transactions', JSON.stringify(updated));
        }
    };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingTransaction(null); };

    const renderResumoMensal = () => {
        const entradas = filteredTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
        const saidas = filteredTransactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const saldo = entradas - saidas;
        return (
            <div className="resumo-grid">
                <div className="card-info" style={{ borderLeft: '4px solid var(--success)' }}>
                    <span>Entradas</span><strong style={{ color: 'var(--success)' }}>{formatCurrency(entradas)}</strong>
                </div>
                <div className="card-info" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <span>Saídas</span><strong style={{ color: 'var(--danger)' }}>{formatCurrency(saidas)}</strong>
                </div>
                <div className="card-info" style={{ borderLeft: `4px solid ${saldo >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
                    <span>Saldo</span><strong style={{ color: saldo >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>{formatCurrency(saldo)}</strong>
                </div>
            </div>
        );
    };

    return (
        <main>
            <section className="header-section">
                <div className="header-top-row">
                    <h3>Visão Geral</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setIsRecurringModalOpen(true)} 
                            className="theme-toggle-btn" 
                            style={{ fontSize: '1rem', width: 'auto' }}
                            title="Gerenciar Contas Fixas e Salários"
                        >
                            📅 Agendamentos / Fixas
                        </button>
                        <button onClick={toggleTheme} className="theme-toggle-btn" title="Mudar Tema">{theme === 'light' ? '🌙' : '☀️'}</button>
                    </div>
                </div>
                <div className="filters">
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ fontWeight: 'bold' }}>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

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

            <section>{renderResumoMensal()}</section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Transações ({filteredTransactions.length})</h3>
                    <button className="btn-add" onClick={() => setIsModalOpen(true)}>+ Nova</button>
                </div>
                <ul className="transaction-list">
                    {filteredTransactions.slice().reverse().map(t => (
                        <li key={t.id} className={t.type}>
                            <div className="trans-info">
                                <span className="trans-desc">
                                    {t.isRecurring && "🔄 "} 
                                    {t.description}
                                </span>
                                <span className="trans-cat">{t.category}</span>
                            </div>
                            <div className="trans-right">
                                <span>{formatCurrency(t.amount)}</span>
                                <button onClick={() => handleEdit(t)} className="btn-icon">✏️</button>
                                <button onClick={() => handleDelete(t.id)} className="btn-icon delete">🗑️</button>
                            </div>
                        </li>
                    ))}
                    {filteredTransactions.length === 0 && <li className="empty-state">Nenhuma transação encontrada em {filterYear}.</li>}
                </ul>
            </section>

            <section>
                <h3>Gráfico Anual</h3>
                <div className="chart-container"><canvas id="myChart"></canvas></div>
            </section>

            <section className="annual-report-section">
                {renderAnnualReport()}
            </section>

            {isModalOpen && (
                <AddTransaction 
                    onClose={handleCloseModal} 
                    onTransactionAdded={loadData}
                    transactionToEdit={editingTransaction}
                    initialYear={parseInt(filterYear)}
                    initialMonth={parseInt(filterMonth)}
                />
            )}

            {isRecurringModalOpen && (
                <RecurringExpenses
                    onClose={() => setIsRecurringModalOpen(false)}
                    onUpdate={loadData}
                />
            )}
        </main>
    );
}

export default Dashboard;