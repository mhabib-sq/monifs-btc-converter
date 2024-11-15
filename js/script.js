document.getElementById('convertButton').addEventListener('click', convert);
document.getElementById('fromCurrency').addEventListener('change', updateFromImage);
// document.getElementById('cryptoAmount').addEventListener('change', convert);

document.getElementById('cryptoAmount').addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        convert()
    }
})

async function fetchCryptoPrice(crypto, currency) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`);
    const data = await response.json();
    return data[crypto][currency];
}

function updateFromImage() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const fromImage = document.getElementById('fromImage');

    if (fromCurrency === 'bitcoin') {
        fromImage.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/640px-Bitcoin.svg.png';
    } else if (fromCurrency === 'ethereum') {
        fromImage.src = 'https://m.media-amazon.com/images/I/51T9i1l0IYL.jpg';
    } else if (fromCurrency === 'tether') {
        fromImage.src = 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Tether-USDT-icon.png';
    }
}

async function convert() {
    const cryptoAmount = parseFloat(document.getElementById('cryptoAmount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
        document.getElementById('exchangeRate').textContent = 'Please enter a valid amount.';
        return;
    }

    try {
        const price = await fetchCryptoPrice(fromCurrency, toCurrency);
        const convertedAmount = cryptoAmount * price;
        document.getElementById('exchangeRate').textContent = `${cryptoAmount} ${fromCurrency.toUpperCase()} = ${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}`;
    } catch (error) {
        document.getElementById('exchangeRate').textContent = 'Error fetching the price. Please try again later.';
    }
}