document.getElementById('convertButton').addEventListener('click', convert);
document.getElementById('fromCurrency').addEventListener('change', updateFromImage);

// the primary use of this debounce function is so that it can handle the input delay!
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedConvert = debounce(convert, 500);
document.getElementById('cryptoAmount').addEventListener("input", debouncedConvert);

async function fetchCryptoPrice(crypto, currency) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`);
    const data = await response.json();
    return data[crypto][currency];
}

function updateFromImage() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const fromImage = document.getElementById('fromImage');

    if (fromCurrency === 'bitcoin') {
        fromImage.src = 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg';
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

async function fetchHistoricalData() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7');
    const data = await response.json();
    console.log(data);
    return data.prices.map(price => ({
        time: new Date(price[0]).toLocaleDateString(),
        value: price[1]
    }));
}

async function renderChart() {
    const historicalData = await fetchHistoricalData();

    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get canvas context');
        return;
    }

    // the code mentioned below is utilized to see if we have 'valid data' to actually render.
    if (historicalData.length === 0) {
        console.error('No historical data to render');
        return;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.map(data => data.time),  // these are going to be the labels for the x-axis
            datasets: [{
                label: 'BTC to USD',
                data: historicalData.map(data => data.value),  // this the relevant price information data for the y-axis
                borderColor: '#F7931A',  // line color
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7  // the primary use of this is to imit number of date ticks to avoid overcrowding
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price in USD'
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

window.onload = async function () {
    await renderChart();
};
