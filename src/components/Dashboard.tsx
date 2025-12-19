import React, { useEffect, useState } from "react";
import '../styles/components/Dashboard.css';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


const pagamentosMes = [ {
        id: 1,
        description: "Aluguel",
        value: 620,
        date: "2023-01-05",
        type: "debit",
    }, {
        id: 2,
        description: "Supermercado",
        value: 300,
        date: "2023-01-10",
        type: "debit",
    }
]

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: "credit" | "debit";
}

function Dashboard() {
    
    const [accountBalance, setAccountBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const chartRef = React.useRef<Chart | null>(null);
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    //minimo 920 maximo 1850
    const extractYear = [920, 750, 880, 990, 1100, 1050, 1200, 1300, 1250, 1400, 1500, 1800];

    useEffect(() => {
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (ctx) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                    datasets: [{
                        label: 'Transações mensais',
                        data: extractYear,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            beginAtZero: true
                        },
                        
                    }
                }
            });
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);
    
    useEffect(() => {
        setTransactions([
            { id: 1, description: "Salário", amount: 1850.00, type: "credit" },
            { id: 2, description: "Aluguel", amount: -620.00, type: "debit" },
            { id: 3, description: "Supermercado", amount: -300.00, type: "debit" },
        ]);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setAccountBalance(
                transactions.reduce((total, transaction) => {
                    return total + transaction.amount;
                }, 0)
            );
            }, 2000);
    }, [transactions]);

    function relatorioAnual() {
        const formatarGrana = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

        const salarioAnual = (transactions.find(t => t.description === "Salário")?.amount || 0) * 12;
        const gastosAnual = extractYear.reduce((acc, val) => acc + val, 0);
        const saldoAnual = salarioAnual - gastosAnual;
        
        const porcentagemGasto = Math.min((gastosAnual / salarioAnual) * 100, 100);

        let statusColor = "";
        let mensagem = "";
        
        if (saldoAnual < 0) {
            statusColor = "#e74c3c";
            mensagem = "🚨 Cuidado! Você está no vermelho. Corte gastos urgente.";
        } else if (porcentagemGasto > 80) {
            statusColor = "#f39c12";
            mensagem = "⚠️ Atenção! Você está gastando quase tudo que ganha.";
        } else {
            statusColor = "#27ae60";
            mensagem = "🚀 Mandou bem! Sua saúde financeira está ótima.";
        }

        return (
            <div className="relatorio-container">
                <div className="resumo-grid">
                    <div className="card-info">
                        <span>Renda Anual</span>
                        <strong>{formatarGrana(salarioAnual)}</strong>
                    </div>
                    <div className="card-info">
                        <span>Gastos Anuais</span>
                        <strong style={{ color: '#c0392b' }}>{formatarGrana(gastosAnual)}</strong>
                    </div>
                    <div className="card-info">
                        <span>Saldo Final</span>
                        <strong style={{ color: saldoAnual >= 0 ? '#27ae60' : '#c0392b' }}>
                            {formatarGrana(saldoAnual)}
                        </strong>
                    </div>
                </div>

                <div className="progress-area">
                    <p>Comprometimento da Renda: <strong>{porcentagemGasto.toFixed(1)}%</strong></p>
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

                <div className="mensagem-final" style={{ borderColor: statusColor, color: statusColor }}>
                    {mensagem}
                </div>
            </div>
        );
    }




    return (
        <main>
            <section>
                <h3>Dinheiro em conta:</h3>
                <input type="text" value={accountBalance !== null ? `${formatCurrency(accountBalance)}` : "Carregando..."} readOnly />
            </section>
            <section>
                <h3>Transações Recentes:</h3>
                <ul>
                    {transactions.map(transaction => (
                        <li key={transaction.id} className={transaction.type}>
                            {transaction.description}: <span>{formatCurrency(transaction.amount)}</span>
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Gráfico do Mês:</h3>
                <div className="chart-container">
                    <canvas id="myChart"></canvas>
                </div>
            </section>
            <section>
                <h3>Relatório anual</h3>
                {relatorioAnual()}
            </section>
        </main>
    )
}

export default Dashboard;
