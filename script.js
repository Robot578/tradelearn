// Простой тренажер трейдинга
class TradeLearn {
    constructor() {
        this.balance = 10000.00;
        this.portfolio = {
            'BTC': 0,
            'ETH': 0,
            'ADA': 0
        };
        this.currentPrice = 45000;
        this.priceHistory = [];
        this.isAITyping = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generatePriceHistory();
        this.drawChart();
        this.updateUI();
        
        // Показать приветственное сообщение
        setTimeout(() => {
            this.showAIMessage("Привет! Я ваш AI-помощник. Готов помочь вам освоить трейдинг! 📈");
        }, 1000);
    }

    setupEventListeners() {
        // Торговля
        document.getElementById('buy-btn').addEventListener('click', () => this.executeTrade('buy'));
        document.getElementById('sell-btn').addEventListener('click', () => this.executeTrade('sell'));
        
        // AI Учитель
        document.getElementById('ai-send').addEventListener('click', () => this.processAIMessage());
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processAIMessage();
        });
        
        // Быстрые действия AI
        document.querySelectorAll('.ai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAIAction(action);
            });
        });
        
        // Изменение актива
        document.getElementById('asset-select').addEventListener('change', (e) => {
            this.currentPrice = this.getAssetPrice(e.target.value);
            this.generatePriceHistory();
            this.drawChart();
            this.updatePriceDisplay();
        });
        
        // Таймфреймы
        document.querySelectorAll('.timeframe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.generatePriceHistory();
                this.drawChart();
            });
        });
        
        // Симуляция изменения цены
        setInterval(() => this.updatePrice(), 3000);
    }

    getAssetPrice(asset) {
        const prices = {
            'BTC': 45000,
            'ETH': 3000,
            'ADA': 0.5
        };
        return prices[asset] || 45000;
    }

    generatePriceHistory() {
        this.priceHistory = [];
        let price = this.currentPrice;
        
        for (let i = 0; i < 50; i++) {
            // Случайное движение цены
            const change = (Math.random() - 0.5) * 0.02; // ±1%
            price = price * (1 + change);
            this.priceHistory.push({
                time: i,
                price: price
            });
        }
        
        this.currentPrice = price;
    }

    drawChart() {
        const canvas = document.getElementById('priceChart');
        const ctx = canvas.getContext('2d');
        
        // Установка размеров
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Очистка
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.priceHistory.length === 0) return;
        
        // Находим min и max цены
        const prices = this.priceHistory.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        
        // Настройки графика
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        // Рисуем линию графика
        ctx.beginPath();
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        
        this.priceHistory.forEach((point, index) => {
            const x = padding + (index / (this.priceHistory.length - 1)) * chartWidth;
            const y = canvas.height - padding - ((point.price - minPrice) / priceRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Рисуем последнюю точку
        const lastPoint = this.priceHistory[this.priceHistory.length - 1];
        const lastX = padding + chartWidth;
        const lastY = canvas.height - padding - ((lastPoint.price - minPrice) / priceRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(lastX, lastY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#2962ff';
        ctx.fill();
        
        // Подписи
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Min цена
        ctx.fillText('$' + minPrice.toFixed(0), padding - 20, canvas.height - padding + 5);
        // Max цена
        ctx.fillText('$' + maxPrice.toFixed(0), padding - 20, padding - 5);
    }

    updatePrice() {
        // Случайное изменение цены
        const change = (Math.random() - 0.5) * 0.01; // ±0.5%
        this.currentPrice = this.currentPrice * (1 + change);
        
        // Добавляем новую точку в историю
        this.priceHistory.push({
            time: this.priceHistory.length,
            price: this.currentPrice
        });
        
        // Удаляем старые точки
        if (this.priceHistory.length > 50) {
            this.priceHistory.shift();
        }
        
        this.drawChart();
        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const priceElement = document.getElementById('current-price');
        const changeElement = document.querySelector('.price-change');
        
        const previousPrice = this.priceHistory.length > 1 ? 
            this.priceHistory[this.priceHistory.length - 2].price : this.currentPrice;
        const change = ((this.currentPrice - previousPrice) / previousPrice) * 100;
        
        priceElement.textContent = '$' + this.currentPrice.toFixed(2);
        changeElement.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeElement.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
    }

    executeTrade(type) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        const asset = document.getElementById('asset-select').value;
        
        if (isNaN(amount) || amount <= 0) {
            alert('Введите корректную сумму');
            return;
        }
        
        if (type === 'buy') {
            if (amount > this.balance) {
                alert('Недостаточно средств');
                return;
            }
            
            const assetAmount = amount / this.currentPrice;
            this.portfolio[asset] += assetAmount;
            this.balance -= amount;
            
            this.showAIMessage(`✅ Успешная покупка! 
Куплено: ${assetAmount.toFixed(6)} ${asset}
Сумма: $${amount.toFixed(2)}
Цена: $${this.currentPrice.toFixed(2)}`);
            
        } else if (type === 'sell') {
            const assetAmount = amount / this.currentPrice;
            
            if (assetAmount > this.portfolio[asset]) {
                alert('Недостаточно активов');
                return;
            }
            
            this.portfolio[asset] -= assetAmount;
            this.balance += amount;
            
            this.showAIMessage(`✅ Успешная продажа!
Продано: ${assetAmount.toFixed(6)} ${asset}
Сумма: $${amount.toFixed(2)}
Цена: $${this.currentPrice.toFixed(2)}`);
        }
        
        this.updateUI();
    }

    processAIMessage() {
        if (this.isAITyping) return;
        
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Показываем сообщение пользователя
        this.showAIMessage(`Вы: ${message}`);
        input.value = '';
        
        // Имитация задержки AI
        this.isAITyping = true;
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.showAIMessage(response);
            this.isAITyping = false;
        }, 1000);
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравств')) {
            return "🤖 AI: Привет! Рад вас видеть! Я помогу вам освоить трейдинг. Задавайте вопросы!";
        }
        
        if (lowerMessage.includes('анализ') || lowerMessage.includes('график')) {
            const change = ((this.currentPrice - this.priceHistory[0].price) / this.priceHistory[0].price) * 100;
            return `🤖 AI: Анализ графика:
Текущая цена: $${this.currentPrice.toFixed(2)}
Изменение: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
${change > 0 ? '📈 Восходящий тренд' : '📉 Нисходящий тренд'}`;
        }
        
        if (lowerMessage.includes('купить') || lowerMessage.includes('продать')) {
            return "🤖 AI: Советы по торговле:\n• Начинайте с малых сумм\n• Анализируйте график\n• Используйте стоп-лосс\n• Управляйте рисками";
        }
        
        if (lowerMessage.includes('риск')) {
            return "🤖 AI: Управление рисками - это важно!\n• Рискуйте не более 2% от депозита\n• Всегда ставьте стоп-лосс\n• Диверсифицируйте портфель";
        }
        
        return "🤖 AI: Я могу помочь с:\n• Анализом графика\n• Советами по торговле\n• Управлением рисками\n• Обучением основам";
    }

    handleAIAction(action) {
        const actions = {
            'analyze': () => {
                const change = ((this.currentPrice - this.priceHistory[0].price) / this.priceHistory[0].price) * 100;
                this.showAIMessage(`🤖 AI: Анализ графика:
📊 Текущая цена: $${this.currentPrice.toFixed(2)}
📈 Изменение: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
${change > 2 ? '🎯 Сильный восходящий тренд' : change < -2 ? '🎯 Сильный нисходящий тренд' : '➡️ Боковой тренд'}`);
            },
            'learn': () => {
                this.showAIMessage(`🤖 AI: Основы трейдинга:
1️⃣ Изучите графики и свечи
2️⃣ Начните с демо-счета
3️⃣ Освойте технический анализ
4️⃣ Управляйте рисками
5️⃣ Торгуйте по плану`);
            },
            'risks': () => {
                this.showAIMessage(`🤖 AI: Управление рисками:
🛡️ Правило 2% - не рискуйте более 2% депозита
🎯 Стоп-лосс - всегда ограничивайте убытки
📊 Диверсификация - не кладите все яйца в одну корзину
💪 Дисциплина - следуйте торговому плану`);
            }
        };
        
        if (actions[action]) {
            actions[action]();
        }
    }

    showAIMessage(message) {
        const messageElement = document.getElementById('ai-message');
        messageElement.textContent = message;
    }

    updateUI() {
        document.getElementById('balance').textContent = this.balance.toFixed(2) + ' USDT';
        document.getElementById('btc-amount').textContent = this.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.portfolio.ETH.toFixed(6);
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    new TradeLearn();
});
