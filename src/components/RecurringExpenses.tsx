import React, { useState, useEffect } from 'react';
import '../styles/components/RecurringExpenses.css';
import { RecurringExpense, CATEGORIES, formatCurrency, Transaction } from '../utils/finance.ts';

interface RecurringExpensesProps {
    onClose: () => void;
    onUpdate: () => void;
}

function RecurringExpenses({ onClose, onUpdate }: RecurringExpensesProps) {
    const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
    
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState('5');
    const [category, setCategory] = useState('Contas Fixas');

    useEffect(() => {
        const saved = localStorage.getItem('recurring_expenses');
        if (saved) setExpenses(JSON.parse(saved));
    }, []);

    const handleSave = () => {
        const valorNumerico = parseFloat(amount);
        if (!description || isNaN(valorNumerico)) return;

        const newExpense: RecurringExpense = {
            id: Date.now(),
            description,
            amount: valorNumerico,
            category,
            day: parseInt(day),
            lastGenerated: undefined
        };

        const updatedList = [...expenses, newExpense];
        setExpenses(updatedList);
        localStorage.setItem('recurring_expenses', JSON.stringify(updatedList));
        
        setDescription('');
        setAmount('');
        onUpdate(); 
    };

    const handleDelete = (id: number) => {
        const confirmDelete = window.confirm(
            "Você deseja excluir apenas a regra de recorrência futura ou também TODAS as transações já geradas por ela?\n\n" +
            "• Clique em 'OK' para excluir TUDO (Regra + Histórico).\n" +
            "• Clique em 'Cancelar' para cancelar a operação."
        );

        if (confirmDelete) {
            const updatedRecurringList = expenses.filter(e => e.id !== id);
            setExpenses(updatedRecurringList);
            localStorage.setItem('recurring_expenses', JSON.stringify(updatedRecurringList));

            const savedTransactions = localStorage.getItem('transactions');
            if (savedTransactions) {
                const transactions: Transaction[] = JSON.parse(savedTransactions);
                const updatedTransactions = transactions.filter(t => t.recurringId !== id);
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            }
            
            onUpdate();
        }
    };

    return (
        <div className="recurring-modal-overlay">
            <div className="recurring-modal-content">
                <div className="recurring-modal-header">
                    <h2>Gerenciar Contas Fixas</h2>
                    <button onClick={onClose} className="close-btn" style={{ fontSize: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✖</button>
                </div>

                <div className="recurring-list-container">
                    {expenses.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Nenhuma conta fixa cadastrada.</p>}
                    <ul>
                        {expenses.map(e => (
                            <li key={e.id} className="recurring-list-item">
                                <div className="recurring-item-info">
                                    <strong className="recurring-item-title">{e.description}</strong>
                                    <div className="recurring-item-meta">
                                        Dia {e.day} • <span className="recurring-category-tag">{e.category}</span>
                                    </div>
                                </div>
                                <div className="recurring-item-actions">
                                    <span className="recurring-item-amount">{formatCurrency(e.amount)}</span>
                                    <button 
                                        onClick={() => handleDelete(e.id)} 
                                        className="btn-recurring-delete"
                                        title="Excluir regra e histórico vinculado"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="recurring-form-section">
                    <h3 className="recurring-form-title">Adicionar Nova Recorrência</h3>
                    
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Descrição</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Internet, Luz" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                    />

                    <div className="recurring-form-grid">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Valor</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dia Venc.</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="31" 
                                value={day} 
                                onChange={e => setDay(e.target.value)} 
                            />
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <button onClick={handleSave} className="recurring-submit-btn">
                        + Adicionar Recorrência
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecurringExpenses;