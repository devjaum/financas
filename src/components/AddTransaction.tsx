import React, {FormEvent, useState} from 'react'
import '../styles/components/AddTransaciton.css'

interface AddTransactionProps {
    onTrasactionAdded: () => void;
    onClose: () => void;
}

// onTrasactionAdded => Serve para avisar o dashboard que houve alteração(nova transação);
// onClose => Fechar modal.

function AddTransaction({onTrasactionAdded, onClose}: AddTransactionProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'credit' | 'debit'>('credit'); //Normalmente o padrão para lançamento, é de gastos.

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const valorNumerico = parseFloat(amount);
        if (!description || isNaN(valorNumerico)) return;

        const newTransaction = {
            id: Date.now(),
            description,
            amount: type === 'debit' ? -Math.abs(valorNumerico) : Math.abs(valorNumerico),
            type,
            date: new Date().toISOString()
        };

        const exitingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const updatedTransactions = [...exitingTransactions, newTransaction];
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        setDescription('');
        setAmount('');
        setType('credit');

        onTrasactionAdded();
        onClose();
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Nova Transação</h2>
                    <button onClick={onClose} className="close-btn">✖</button>
                </div>

                <form onSubmit={handleSubmit} className={`form-add-transaction ${type === "credit" ? "active credit" : "active debit"}`}>
                    <div className="transaction-type-selector">
                        <button 
                            type="button" 
                            className={type === 'credit' ? 'active credit' : ''}
                            onClick={() => setType('credit')}
                        >
                            ⬆ Entrada
                        </button>
                        <button 
                            type="button" 
                            className={type === 'debit' ? 'active debit' : ''}
                            onClick={() => setType('debit')}
                        >
                            ⬇ Saída
                        </button>
                    </div>
                    <text>Descrição</text>
                    <input 
                        type="text" 
                        placeholder="Descrição (ex: Aluguel)" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <text>Valor</text>
                    <input 
                        type="number" 
                        placeholder="Valor (ex: 200.50)" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <button type="submit" className="submit-btn">
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    )


}

//Componente responsável por adicionar entrada/saída no dashboard.

export default AddTransaction;