import React, { useEffect, useState } from "react";
import '../styles/components/Dashboard.css';
import AddTransaction from './AddTransaction.tsx';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date?: string; // Adicionamos a data (opcional para suportar antigos)
}

function Dashboard() {
    
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chartRef = React.useRef<Chart | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const extractYear = [924.52, 800.84, 872.85, 1698.92, 1831.83, 870.57, 785.90, 1297.26, 1267.42, 1335.73, 780.17, 880.52];

    const loadData = () => {
        const savedTransactions = localStorage.getItem('transactions');
        const transactionsList = savedTransactions ? JSON.parse(savedTransactions) : [];

        const savedConfig = localStorage.getItem('finance_config');
        const config = savedConfig ? JSON.parse(savedConfig) : null;

        if (transactionsList.length > 0) {
            setTransactions(transactionsList);
        } else if (config) {
            const initialTransaction: Transaction = {
                id: Date.now(),
                description: "Saldo Inicial",
                amount: config.saldoInicial || 0,
                type: "credit",
                date: new Date().toISOString()
            };
            setTransactions([initialTransaction]);
            localStorage.setItem('transactions', JSON.stringify([initialTransaction]));
        } else {
            setTransactions([]);
        }
    };

    useEffect(() => {
        if(!localStorage.getItem('finance_config')){
            const defaultConfig = {
                salario: 1858.73,
                saldoInicial: 1858.73,
                meta: 5000,
                primeiroAcesso: true
            };
            localStorage.setItem('finance_config', JSON.stringify(defaultConfig));
        }
        loadData();
    }, []);

    useEffect(() => {
        const total = transactions.reduce((acc, transaction) => {
            return acc + transaction.amount;
        }, 0);
        setAccountBalance(total);
    }, [transactions]);

    useEffect(() => {
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (ctx) {
            if (chartRef.current) chartRef.current.destroy();
            
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [{
                        label: 'Histórico de Gastos',
                        data: extractYear,
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        borderColor: '#27ae60',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, []);

    function relatorioMensal() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const transacoesDoMes = transactions.filter(t => {
            if (!t.date) return true; 
            const tDate = new Date(t.date);
            return tDate.getMonth() === mesAtual && tDate.getFullYear() === anoAtual;
        });

        const entradas = transacoesDoMes
            .filter(t => t.type === 'credit')
            .reduce((acc, t) => acc + t.amount, 0);

        const saidas = transacoesDoMes
            .filter(t => t.type === 'debit')
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        const saldoMes = entradas - saidas;

        return (
            <div className="relatorio-container">
                <div className="resumo-grid">
                    <div className="card-info" style={{ borderLeft: '4px solid #27ae60' }}>
                        <span>Entradas (Mês)</span>
                        <strong style={{ color: '#27ae60' }}>{formatCurrency(entradas)}</strong>
                    </div>
                    <div className="card-info" style={{ borderLeft: '4px solid #c0392b' }}>
                        <span>Saídas (Mês)</span>
                        <strong style={{ color: '#c0392b' }}>{formatCurrency(saidas)}</strong>
                    </div>
                    <div className="card-info" style={{ borderLeft: `4px solid ${saldoMes >= 0 ? '#27ae60' : '#c0392b'}` }}>
                        <span>Saldo (Mês)</span>
                        <strong style={{ color: saldoMes >= 0 ? '#2c3e50' : '#c0392b' }}>
                            {formatCurrency(saldoMes)}
                        </strong>
                    </div>
                </div>
            </div>
        );
    }

    function relatorioAnual() {
        const savedConfig = localStorage.getItem('finance_config');
        const config = savedConfig ? JSON.parse(savedConfig) : null;
        
        const salarioMensal = config ? config.salario : 0; 
        const rendaAnualEstimada = salarioMensal * 12;
        

        const totalGastos = transactions
            .filter(t => t.type === 'debit')
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        
        const countGastos = transactions.filter(t => t.type === 'debit').length;
        
        const gastosAtuais = totalGastos; 

        const projecaoAnualGastos = gastosAtuais > 0 ? gastosAtuais * 12 : extractYear.reduce((a,b)=>a+b, 0); 

        const saldoAnual = rendaAnualEstimada - projecaoAnualGastos;
        const porcentagemGasto = rendaAnualEstimada > 0 
            ? Math.min((projecaoAnualGastos / rendaAnualEstimada) * 100, 100) 
            : 0;

        let statusColor = "#27ae60";
        let mensagem = "🚀 Finanças saudáveis! Mantenha o foco.";
        
        if (saldoAnual < 0) {
            statusColor = "#e74c3c";
            mensagem = "🚨 Perigo! Seus gastos anuais projetados superam seu salário.";
        } else if (porcentagemGasto > 80) {
            statusColor = "#f39c12";
            mensagem = "⚠️ Cuidado! Você está vivendo no limite do orçamento.";
        }

        return (
            <div className="relatorio-container">
                <div className="progress-area">
                    <p>Comprometimento Anual da Renda: <strong>{porcentagemGasto.toFixed(1)}%</strong></p>
                    <div className="progress-bar-bg">
                        <div 
                            className="progress-bar-fill" 
                            style={{ 
                                width: `${porcentagemGasto}%`, 
                                backgroundColor: statusColor 
                            }}
                        ></div>
                    </div>
                </div>

                <div className="resumo-grid">
                    <div className="card-info">
                        <span>Renda Anual (Salário x12)</span>
                        <strong>{formatCurrency(rendaAnualEstimada)}</strong>
                    </div>
                    <div className="card-info">
                        <span>Gasto Anual (Projetado)</span>
                        <strong style={{ color: '#c0392b' }}>{formatCurrency(projecaoAnualGastos)}</strong>
                    </div>
                </div>

                <div className="mensagem-final" style={{ borderColor: statusColor, color: statusColor }}>
                    {mensagem}
                </div>
            </div>
        );
    }

    const handleDelete = (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir este item?")) {
            const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
            setTransactions(updatedTransactions);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        }
    };

    return (
        <main>
            <section>
                <h3>Dinheiro em conta (Total):</h3>
                <input 
                    type="text" 
                    value={formatCurrency(accountBalance)} 
                    readOnly 
                />
            </section>

            <section>
                <h3>Resumo deste Mês</h3>
                {relatorioMensal()}
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, border: 'none' }}>Transações Recentes:</h3>
                    <button 
                        className="btn-add" 
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Nova
                    </button>
                </div>

                <ul>
                    {[...transactions].reverse().slice(0, 5).map(transaction => (
                        <li key={transaction.id} className={transaction.type}>
                            <span className="trans-desc">{transaction.description}</span>
                            <div className="trans-right">
                                <span>{formatCurrency(transaction.amount)}</span>
                                <button 
                                    onClick={() => handleDelete(transaction.id)} 
                                    className="btn-delete"
                                    title="Excluir"
                                >
                                    🗑️
                                </button>
                            </div>
                        </li>
                    ))}
                    {transactions.length === 0 && (
                        <li style={{ color: '#999', justifyContent: 'center' }}>Nenhuma transação ainda.</li>
                    )}
                </ul>
                {transactions.length > 5 && (
                    <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#888', marginTop: '10px'}}>
                        Exibindo as 5 mais recentes de {transactions.length}
                    </p>
                )}
            </section>

            <section>
                <h3>Gráfico do Ano:</h3>
                <div className="chart-container">
                    <canvas id="myChart"></canvas>
                </div>
            </section>

            <section>
                <h3>Análise Anual de Saúde Financeira</h3>
                {relatorioAnual()}
            </section>

            {isModalOpen && (
                <AddTransaction 
                    onClose={() => setIsModalOpen(false)} 
                    onTrasactionAdded={loadData} 
                />
            )}
        </main>
    )
}

export default Dashboard;