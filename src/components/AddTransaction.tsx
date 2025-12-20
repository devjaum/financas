import React, { FormEvent, useState, useEffect } from 'react';
import '../styles/components/AddTransaciton.css';
import { Transaction, CATEGORIES } from '../utils/finance.ts';

interface AddTransactionProps {
    onTransactionAdded: () => void;
    onClose: () => void;
    transactionToEdit?: Transaction | null;
}

function AddTransaction({ onTransactionAdded, onClose, transactionToEdit }: AddTransactionProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Outros');
    const [type, setType] = useState<'credit' | 'debit'>('debit');
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (transactionToEdit) {
            setDescription(transactionToEdit.description);
            setAmount(Math.abs(transactionToEdit.amount).toString());
            setType(transactionToEdit.type);
            setCategory(transactionToEdit.category || 'Outros');
            
            if (transactionToEdit.date) {
                const localDate = new Date(transactionToEdit.date);
                const formattedDate = localDate.toLocaleDateString('en-CA');
                setDate(formattedDate);
            }
        }
    }, [transactionToEdit]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const valorNumerico = parseFloat(amount);
        if (!description || isNaN(valorNumerico)) return;

        const finalAmount = type === 'debit' ? -Math.abs(valorNumerico) : Math.abs(valorNumerico);
        
        const [year, month, day] = date.split('-').map(Number);
        const finalDateObj = new Date(year, month - 1, day); 
        const finalDateISO = finalDateObj.toISOString();

        const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        let updatedTransactions;

        if (transactionToEdit) {
            updatedTransactions = savedTransactions.map((t: Transaction) => 
                t.id === transactionToEdit.id 
                ? { ...t, description, amount: finalAmount, type, category, date: finalDateISO } 
                : t
            );
        } else {
            const newTransaction: Transaction = {
                id: Date.now(),
                description,
                amount: finalAmount,
                type,
                date: finalDateISO, 
                category
            };
            updatedTransactions = [...savedTransactions, newTransaction];
        }

        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        
        setDescription('');
        setAmount('');
        onTransactionAdded();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</h2>
                    <button onClick={onClose} className="close-btn">✖</button>
                </div>

                <form onSubmit={handleSubmit} className={`form-add-transaction ${type === "credit" ? "active credit" : "active debit"}`}>
                    <div className="transaction-type-selector">
                        <button type="button" className={type === 'credit' ? 'active credit' : ''} onClick={() => setType('credit')}>
                            ⬆ Entrada
                        </button>
                        <button type="button" className={type === 'debit' ? 'active debit' : ''} onClick={() => setType('debit')}>
                            ⬇ Saída
                        </button>
                    </div>

                    <label>Descrição</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Aluguel" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <label>Data</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    <label>Categoria</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <label>Valor</label>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        step="0.01"
                    />

                    <button type="submit" className="submit-btn">
                        {transactionToEdit ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddTransaction;