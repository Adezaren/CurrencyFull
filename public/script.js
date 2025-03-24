async function convertCurrency () {
    
    const amount = parseFloat(document.getElementById('amount').value);
    const targetCurrency = document.getElementById('currency').value;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Zadejte kladnou sumu.');
        return;
    }

    const response = await fetch(`http://localhost:3000/api/convert?amount=${amount}&currency=${targetCurrency}`);
    const data = await response.json();

    document.getElementById('result').textContent = `${amount} EUR = ${data.convertedAmount.toFixed(2)} ${targetCurrency}`;

    fetchStats();
    
};

async function fetchCurrencies() {
    
    const response = await fetch('http://localhost:3000/api/currencies');
    const data = await response.json();
    const currencySelect = document.getElementById('currency');

    currencySelect.innerHTML = '';
    
    data.currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.symbol;
        option.textContent = `${currency.symbol} - ${currency.name}`;
        currencySelect.appendChild(option);
    });

}

async function fetchStats() {

    const response = await fetch('http://localhost:3000/api/stats');
    const data = await response.json();

    const mostCurrency = data.conversions.length > 0 ? data.conversions[0]._id: "žádná data";
    const conversionsAmount = data.conversions.find(c => c._id === document.getElementById('currency').value)?.count || 0;

    document.getElementById('stats').innerHTML = `
        <p><strong>Nejčastější měna: </strong> ${mostCurrency}</p>
        <p><strong>Počet konverzí dané měny: </strong> ${conversionsAmount}</p>
        <p><strong>Celkový počet konverzí: </strong> ${data.totalConversions}</p>
    `;
    
}


fetchCurrencies();

