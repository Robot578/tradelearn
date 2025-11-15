// TradeLearn AI - Полная версия с ИИ-учителем
class TradeLearnAI {
    constructor() {
        this.chart = null;
        this.candleSeries = null;
        this.currentData = [];
        this.balance = 10000.00;
        this.portfolio = {
            'USDT': 10000.00,
            'BTC': 0,
            'ETH': 0,
            'ADA': 0,
            'DOT': 0,
            'SOL': 0
        };
        this.currentAsset = 'BTCUSDT';
        this.currentTimeframe = '15m';
        this.isAITyping = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.initializeChart();
        this.generateHistoricalData();
        this.showAIMessage("🎉 Добро пожаловать в TradeLearn AI! Я ваш умный помощник в мире трейдинга. Готовы начать обучение?");
        
        // Автоматическое приветствие через 2 секунды
        setTimeout(() => {
            this.showTutorialStep(1);
        }, 2000);
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Закрытие секций
        document.querySelectorAll('.close-section').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showSection('chart');
            });
        });

        // Переключение сайдбара
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });

        // Выбор актива
        document.getElementById('asset-select').addEventListener('change', (e) => {
            this.currentAsset = e.target.value;
            this.generateHistoricalData();
        });

        // Таймфреймы
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentTimeframe = e.currentTarget.dataset.tf;
                this.generateHistoricalData();
            });
        });

        // Торговля
        document.getElementById('buy-btn').addEventListener('click', () => this.executeTrade('buy'));
        document.getElementById('sell-btn').addEventListener('click', () => this.executeTrade('sell'));

        // AI Учитель
        document.getElementById('send-ai-message').addEventListener('click', () => this.processAIMessage());
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processAIMessage();
        });

        // Быстрые действия AI
        document.querySelectorAll('.ai-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAIAction(action);
            });
        });

        // Шаги обучения
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNum = e.currentTarget.dataset.step;
                this.showTutorialStep(parseInt(stepNum));
            });
        });

        // Обновление цены в реальном времени
        setInterval(() => this.updateRealTimePrice(), 2000);
    }

    initializeChart() {
        const chartContainer = document.getElementById('candleChart');
        
        this.chart = LightweightCharts.createChart(chartContainer, {
            layout: {
                background: { color: '#0a0a0a' },
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
            },
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
        });

        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff4444',
            borderDownColor: '#ff4444',
            borderUpColor: '#00c853',
            wickDownColor: '#ff4444',
            wickUpColor: '#00c853',
        });

        // Адаптация к размеру окна
        new ResizeObserver(entries => {
            if (entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            this.chart.applyOptions({ width, height });
        }).observe(chartContainer);
    }

    generateHistoricalData() {
        this.showLoading();
        
        setTimeout(() => {
            const data = [];
            let price = this.getBasePrice();
            const baseTime = Date.now() / 1000 - 30 * 24 * 60 * 60;
            const volatility = this.getVolatility();

            for (let i = 0; i < 200; i++) {
                const time = baseTime + i * this.getTimeInterval();
                const change = (Math.random() - 0.5) * volatility;
                
                const open = price;
                const close = price * (1 + change);
                const high = Math.max(open, close) * (1 + Math.random() * 0.02);
                const low = Math.min(open, close) * (1 - Math.random() * 0.02);

                data.push({
                    time: time,
                    open: open,
                    high: high,
                    low: low,
                    close: close
                });

                price = close;
            }

            this.currentData = data;
            this.candleSeries.setData(data);
            this.updateCurrentPrice(data[data.length - 1]);
            this.hideLoading();

        }, 1000);
    }

    getBasePrice() {
        const prices = {
            'BTCUSDT': 45000,
            'ETHUSDT': 3000,
            'ADAUSDT': 0.5,
            'DOTUSDT': 7,
            'SOLUSDT': 100
        };
        return prices[this.currentAsset] || 100;
    }

    getVolatility() {
        const volatilities = {
            '1m': 0.002,
            '5m': 0.005,
            '15m': 0.008,
            '1h': 0.015,
            '4h': 0.025,
            '1d': 0.04
        };
        return volatilities[this.currentTimeframe] || 0.01;
    }

    getTimeInterval() {
        const intervals = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '4h': 14400,
            '1d': 86400
        };
        return intervals[this.currentTimeframe] || 900;
    }

    updateRealTimePrice() {
        if (this.currentData.length === 0) return;

        const lastCandle = this.currentData[this.currentData.length - 1];
        const change = (Math.random() - 0.5) * this.getVolatility() * 0.5;
        
        const newCandle = {
            time: Date.now() / 1000,
            open: lastCandle.close,
            close: lastCandle.close * (1 + change),
            high: Math.max(lastCandle.close, lastCandle.close * (1 + change)) * (1 + Math.random() * 0.01),
            low: Math.min(lastCandle.close, lastCandle.close * (1 + change)) * (1 - Math.random() * 0.01)
        };

        this.currentData.push(newCandle);
        if (this.currentData.length > 500) {
            this.currentData.shift();
        }

        this.candleSeries.update(newCandle);
        this.updateCurrentPrice(newCandle);
    }

    updateCurrentPrice(candle) {
        const priceElement = document.getElementById('current-price');
        const changeElement = document.getElementById('price-change');
        const assetElement = document.getElementById('current-asset');
        const tradePriceElement = document.getElementById('asset-price');

        const prevPrice = this.currentData.length > 1 ? 
            this.currentData[this.currentData.length - 2].close : candle.open;
        const change = ((candle.close - prevPrice) / prevPrice) * 100;

        assetElement.textContent = this.currentAsset.replace('USDT', '/USDT');
        priceElement.textContent = candle.close.toFixed(2);
        tradePriceElement.value = candle.close.toFixed(2);
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    executeTrade(type) {
        if (this.currentData.length === 0) {
            this.showError('Нет данных о текущей цене');
            return;
        }

        const amount = parseFloat(document.getElementById('trade-amount').value);
        const currentPrice = this.currentData[this.currentData.length - 1].close;
        const assetSymbol = this.currentAsset.replace('USDT', '');

        if (isNaN(amount) || amount <= 0) {
            this.showError('Введите корректную сумму');
            return;
        }

        if (type === 'buy') {
            if (amount > this.portfolio.USDT) {
                this.showError(`Недостаточно USDT. Доступно: ${this.portfolio.USDT.toFixed(2)}`);
                return;
            }

            const assetAmount = amount / currentPrice;
            this.portfolio[assetSymbol] += assetAmount;
            this.portfolio.USDT -= amount;

            this.showAIMessage(`✅ Успешная покупка!\n\n💵 Куплено: ${assetAmount.toFixed(6)} ${assetSymbol}\n💰 Сумма: ${amount.toFixed(2)} USDT\n📊 Цена: ${currentPrice.toFixed(2)}\n\n💡 Совет: Следите за стоп-лоссом!`);

        } else if (type === 'sell') {
            const assetAmount = amount / currentPrice;

            if (assetAmount > this.portfolio[assetSymbol]) {
                this.showError(`Недостаточно ${assetSymbol}. Доступно: ${this.portfolio[assetSymbol].toFixed(6)}`);
                return;
            }

            this.portfolio[assetSymbol] -= assetAmount;
            this.portfolio.USDT += amount;

            this.showAIMessage(`✅ Успешная продажа!\n\n💵 Продано: ${assetAmount.toFixed(6)} ${assetSymbol}\n💰 Сумма: ${amount.toFixed(2)} USDT\n📊 Цена: ${currentPrice.toFixed(2)}\n\n💡 Молодец! Не забывайте фиксировать прибыль.`);
        }

        this.updateUI();
        this.showTutorialStep(2);
    }

    // AI Учитель функционал
    async processAIMessage() {
        if (this.isAITyping) return;

        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Показываем сообщение пользователя
        this.showAIMessage(`<strong>Вы:</strong> ${message}`, false);
        input.value = '';

        // Имитация задержки AI
        this.isAITyping = true;
        await this.delay(1000);

        const response = this.generateAIResponse(message);
        this.showAIMessage(response);
        this.isAITyping = false;
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Базовые приветствия
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравств')) {
            return `🤖 <strong>AI Учитель:</strong> Привет! Рад вас видеть! Я готов помочь вам с:\n• 📊 Анализом графиков\n• ⚡ Основами торговли\n• 📈 Индикаторами\n• 🛡️ Управлением рисками\n\nЧто вас интересует?`;
        }

        // Анализ графика
        if (lowerMessage.includes('анализ') || lowerMessage.includes('график') || lowerMessage.includes('тренд')) {
            return this.analyzeCurrentChart();
        }

        // Торговля
        if (lowerMessage.includes('купить') || lowerMessage.includes('продать') || lowerMessage.includes('сделк')) {
            return this.getTradingAdvice();
        }

        // Индикаторы
        if (lowerMessage.includes('индикатор') || lowerMessage.includes('sma') || lowerMessage.includes('rsi') || lowerMessage.includes('macd')) {
            return this.explainIndicators();
        }

        // Риски
        if (lowerMessage.includes('риск') || lowerMessage.includes('стоп') || lowerMessage.includes('лосс')) {
            return this.explainRiskManagement();
        }

        // Обучение
        if (lowerMessage.includes('обуч') || lowerMessage.includes('урок') || lowerMessage.includes('научи')) {
            return this.getLearningPath();
        }

        // Благодарности
        if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар')) {
            return `🤖 <strong>AI Учитель:</strong> Всегда рад помочь! 🎉\nПродолжайте обучение - каждый шаг приближает вас к успеху в трейдинге. Если есть вопросы - обращайтесь!`;
        }

        // Стандартный ответ
        return `🤖 <strong>AI Учитель:</strong> Интересный вопрос! Я могу помочь вам с:\n\n📊 <strong>Анализом текущего графика</strong>\n⚡ <strong>Советами по торговле</strong>\n📈 <strong>Объяснением индикаторов</strong>\n🛡️ <strong>Управлением рисками</strong>\n\nЗадайте более конкретный вопрос или используйте кнопки быстрого доступа!`;
    }

    analyzeCurrentChart() {
        if (this.currentData.length < 10) {
            return `🤖 <strong>AI Учитель:</strong> Недостаточно данных для анализа. Подождите загрузки графика.`;
        }

        const lastCandle = this.currentData[this.currentData.length - 1];
        const prevCandle = this.currentData[this.currentData.length - 2];
        const change = ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100;

        let analysis = `🤖 <strong>AI Анализ ${this.currentAsset.replace('USDT', '/USDT')}:</strong>\n\n`;
        analysis += `📊 <strong>Текущая цена:</strong> $${lastCandle.close.toFixed(2)}\n`;
        analysis += `📈 <strong>Изменение:</strong> ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n\n`;

        if (change > 2) {
            analysis += `🎯 <strong>Сигнал:</strong> ВОСХОДЯЩИЙ ТРЕНД 📈\n`;
            analysis += `💡 <strong>Рекомендация:</strong> Рассмотрите покупку (LONG)\n`;
            analysis += `⚠️  <strong>Внимание:</strong> Установите стоп-лосс ниже поддержки`;
        } else if (change < -2) {
            analysis += `🎯 <strong>Сигнал:</strong> НИСХОДЯЩИЙ ТРЕНД 📉\n`;
            analysis += `💡 <strong>Рекомендация:</strong> Рассмотрите продажу (SHORT)\n`;
            analysis += `⚠️  <strong>Внимание:</strong> Установите стоп-лосс выше сопротивления`;
        } else {
            analysis += `🎯 <strong>Сигнал:</strong> БОКОВОЙ ТРЕНД ➡️\n`;
            analysis += `💡 <strong>Рекомендация:</strong> Ждите четкого сигнала\n`;
            analysis += `⚠️  <strong>Внимание:</strong> Торговля в боковике рискованна`;
        }

        analysis += `\n📚 <strong>Следующий шаг:</strong> Изучите индикаторы для подтверждения`;
        return analysis;
    }

    getTradingAdvice() {
        return `🤖 <strong>AI Учитель:</strong> Советы по торговле:\n\n` +
               `✅ <strong>Начинайте с малого:</strong> 1-2% от депозита\n` +
               `✅ <strong>Анализируйте перед сделкой:</strong> График + индикаторы\n` +
               `✅ <strong>Всегда используйте стоп-лосс:</strong> Защита капитала\n` +
               `✅ <strong>План на выход:</strong> Знайте когда фиксировать прибыль\n\n` +
               `💡 <strong>Помните:</strong> Управление рисками важнее прогнозов!`;
    }

    explainIndicators() {
        return `🤖 <strong>AI Учитель:</strong> Основные индикаторы:\n\n` +
               `📊 <strong>SMA (Simple Moving Average):</strong>\n` +
               `   • Простая скользящая средняя\n` +
               `   • Показывает общий тренд\n` +
               `   • Используйте 20 периодов\n\n` +
               `📈 <strong>RSI (Relative Strength Index):</strong>\n` +
               `   • Индекс относительной силы\n` +
               `   • >70 - перекупленность\n` +
               `   • <30 - перепроданность\n\n` +
               `🎯 <strong>MACD:</strong>\n` +
               `   • Схождение/расхождение средних\n` +
               `   • Показывает изменение тренда\n\n` +
               `💡 <strong>Совет:</strong> Не используйте слишком много индикаторов!`;
    }

    explainRiskManagement() {
        return `🤖 <strong>AI Учитель:</strong> Управление рисками - ВАЖНЕЙШИЙ навык!\n\n` +
               `🛡️ <strong>Правило 2%:</strong> Не рискуйте более 2% депозита в сделке\n` +
               `🎯 <strong>Стоп-лосс:</strong> Всегда устанавливайте ограничение убытков\n` +
               `⚖️ <strong>Риск/Прибыль:</strong> Соотношение минимум 1:2\n` +
               `📊 <strong>Диверсификация:</strong> Не кладите все яйца в одну корзину\n\n` +
               `💡 <strong>Золотое правило:</strong> Сохранить капитал важнее, чем заработать!`;
    }

    getLearningPath() {
        return `🤖 <strong>AI Учитель:</strong> План обучения:\n\n` +
               `1️⃣ <strong>Основы графика:</strong> Свечи, тренды, уровни\n` +
               `2️⃣ <strong>Первые сделки:</strong> Практика на демо-счете\n` +
               `3️⃣ <strong>Индикаторы:</strong> SMA, RSI, MACD\n` +
               `4️⃣ <strong>Стратегии:</strong> Разработка торгового плана\n` +
               `5️⃣ <strong>Психология:</strong> Контроль эмоций\n\n` +
               `🎯 <strong>Начните с первого шага - изучите текущий график!`};
    }

    handleAIAction(action) {
        const actions = {
            'analyze-chart': () => this.showAIMessage(this.analyzeCurrentChart()),
            'trading-lesson': () => this.showAIMessage(this.getTradingAdvice()),
            'risk-management': () => this.showAIMessage(this.explainRiskManagement()),
            'indicators-guide': () => this.showAIMessage(this.explainIndicators())
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    showTutorialStep(step) {
        // Помечаем все шаги как неактивные
        document.querySelectorAll('.tutorial-step').forEach(stepEl => {
            stepEl.classList.remove('completed');
        });

        // Помечаем пройденные шаги
        for (let i = 1; i <= step; i++) {
            const stepEl = document.querySelector(`[data-step="${i}"]`);
            if (stepEl) {
                stepEl.classList.add('completed');
            }
        }

        // Показываем сообщение AI для шага
        const stepMessages = {
            1: "🎯 Отлично! Давайте изучим график. Обратите внимание на японские свечи - они показывают цену открытия, закрытия, максимум и минимум.",
            2: "⚡ Отличная работа! Вы совершили первую сделку. Теперь давайте изучим индикаторы для лучшего анализа.",
            3: "📈 Индикаторы помогают принимать взвешенные решения. SMA показывает тренд, RSI - перекупленность/перепроданность.",
            4: "🛡️ Важнейший этап! Управление рисками - ключ к долгосрочному успеху. Помните правило 2%."
        };

        if (stepMessages[step]) {
            this.showAIMessage(stepMessages[step]);
        }
    }

    showAIMessage(message, showTyping = true) {
        const messageElement = document.getElementById('ai-message');
        
        if (showTyping) {
            messageElement.innerHTML = '<span class="typing">AI Учитель печатает...</span>';
            
            setTimeout(() => {
                messageElement.innerHTML = message.replace(/\n/g, '<br>');
                messageElement.scrollTop = messageElement.scrollHeight;
            }, 1000);
        } else {
            messageElement.innerHTML = message.replace(/\n/g, '<br>');
            messageElement.scrollTop = messageElement.scrollHeight;
        }
    }

    showSection(sectionId) {
        // Скрываем все секции
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Убираем активный класс у всех кнопок
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показываем выбранную секцию
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Активируем кнопку навигации
        const targetBtn = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // Особые действия для секций
        if (sectionId === 'teacher') {
            this.showAIMessage("🎓 Добро пожаловать в режим AI-учителя! Я готов ответить на ваши вопросы и помочь с обучением.");
        } else if (sectionId === 'chart') {
            this.generateHistoricalData();
        }
    }

    updateUI() {
        // Обновляем баланс
        document.getElementById('balance').textContent = this.portfolio.USDT.toFixed(2) + ' USDT';
        document.getElementById('usdt-amount').textContent = this.portfolio.USDT.toFixed(2);
        
        // Обновляем портфель
        document.getElementById('btc-amount').textContent = this.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.portfolio.ETH.toFixed(6);
        document.getElementById('ada-amount').textContent = this.portfolio.ADA.toFixed(6);

        // Обновляем общую стоимость
        const currentPrice = this.currentData.length > 0 ? 
            this.currentData[this.currentData.length - 1].close : this.getBasePrice();
        let totalValue = this.portfolio.USDT;
        
        // Добавляем стоимость активов (упрощенный расчет)
        totalValue += this.portfolio.BTC * (this.currentAsset === 'BTCUSDT' ? currentPrice : 45000);
        totalValue += this.portfolio.ETH * (this.currentAsset === 'ETHUSDT' ? currentPrice : 3000);
        totalValue += this.portfolio.ADA * (this.currentAsset === 'ADAUSDT' ? currentPrice : 0.5);
        totalValue += this.portfolio.DOT * 7;
        totalValue += this.portfolio.SOL * 100;

        document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
    }

    // Вспомогательные методы
    showLoading() {
        document.getElementById('chartLoadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('chartLoadingOverlay').style.display = 'none';
    }

    showError(message) {
        alert(`❌ ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    window.tradeLearnAI = new TradeLearnAI();
});

// Глобальные функции для HTML
function showSection(section) {
    if (window.tradeLearnAI) {
        window.tradeLearnAI.showSection(section);
    }
}
