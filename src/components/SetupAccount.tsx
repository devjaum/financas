import React, { useState } from 'react';
import '../styles/components/SetupAccount.css'; // Vamos criar esse CSS abaixo

function SetupAccount() {
    const [formData, setFormData] = useState({
        nome: '',
        salario: '',
        saldoAtual: '',
        metaEconomia: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const configUser = {
            nome: formData.nome,
            salario: parseFloat(formData.salario),
            saldoInicial: parseFloat(formData.saldoAtual),
            meta: parseFloat(formData.metaEconomia),
            primeiroAcesso: false
        };

        localStorage.setItem('finance_config', JSON.stringify(configUser));

        const transacaoSalario = {
            id: Date.now(),
            description: "Salário Mensal",
            amount: configUser.salario,
            type: "credit"
        };
        
        const currentTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        currentTransactions.push(transacaoSalario);
        localStorage.setItem('transactions', JSON.stringify(currentTransactions));

        alert("Configuração salva com sucesso! Redirecionando para o Dashboard...");
    };

    return (
        <main className="setup-container">
            <section className="setup-card">
                <div className="setup-header">
                    <h2>Bem-vindo! 🚀</h2>
                    <p>Vamos configurar seu perfil financeiro para começar.</p>
                </div>

                <form onSubmit={handleSave}>
                    <div className="input-group">
                        <label>Como você quer ser chamado?</label>
                        <input 
                            type="text" 
                            name="nome" 
                            placeholder="Ex: João Silva" 
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="input-group">
                            <label>Renda Mensal (Salário)</label>
                            <input 
                                type="number" 
                                name="salario" 
                                placeholder="R$ 0,00" 
                                value={formData.salario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Saldo Atual (Bancos/Carteira)</label>
                            <input 
                                type="number" 
                                name="saldoAtual" 
                                placeholder="R$ 0,00" 
                                value={formData.saldoAtual}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Meta de Economia Anual (Opcional)</label>
                        <input 
                            type="number" 
                            name="metaEconomia" 
                            placeholder="Ex: 5000" 
                            value={formData.metaEconomia}
                            onChange={handleChange}
                        />
                        <small>Isso ajuda a calcular seu relatório anual.</small>
                    </div>

                    <button type="submit" className="btn-save">
                        Finalizar Configuração
                    </button>
                </form>
            </section>
        </main>
    );
}

export default SetupAccount;