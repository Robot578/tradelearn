// Добавляем в начало вашего script.js

// База знаний ИИ-учителя
const aiTeacher = {
    // Приветственные сообщения
    greetings: [
        "Привет! Я ваш ИИ-помощник в TradeLearn! 🎓",
        "Рад вас видеть! Давайте освоим трейдинг вместе! 📈",
        "Приветствую! Готовы стать успешным трейдером? ⚡"
    ],

    // Объяснения разделов
    explanations: {
        chart: `📊 <strong>Это график цен!</strong>\n\n• <strong>Японские свечи</strong> показывают цену открытия, закрытия, максимум и минимум\n• <strong>Зеленая свеча</strong> - цена выросла за период\n• <strong>Красная свеча</strong> - цена упала за период\n• <strong>Таймфреймы</strong> (1h, 4h, 1d) - временные интервалы\n\n💡 <strong>Совет:</strong> Изучите тренд перед сделкой!`,

        trading: `⚡ <strong>Торговля - это просто!</strong>\n\n• <strong>КУПИТЬ (LONG)</strong> - если ожидаете рост цены\n• <strong>ПРОДАТЬ (SHORT)</strong> - если ожидаете падение цены\n• <strong>USDT</strong> - стейблкоин, ваша валюта для торговли\n• <strong>Сумма</strong> - сколько вы хотите инвестировать\n\n🎯 <strong>Правило:</strong> Начинайте с малых сумм!`,

        portfolio: `💼 <strong>Ваш инвестиционный портфель</strong>\n\n• <strong>Баланс USDT</strong> - ваши доступные средства\n• <strong>Криптовалюты</strong> - активы которые вы купили\n• <strong>Общая стоимость</strong> - суммарная стоимость портфеля\n\n🛡️ <strong>Важно:</strong> Диверсифицируйте инвестиции!`,

        analyze: function(currentPrice, change) {
            let analysis = `🔍 <strong>Анализ текущего графика:</strong>\n\n`;
            analysis += `• <strong>Цена:</strong> $${currentPrice.toFixed(2)}\n`;
            analysis += `• <strong>Изменение:</strong> ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n\n`;
            
            if (change > 2) {
                analysis += `📈 <strong>Сильный восходящий тренд!</strong>\n`;
                analysis += `💡 Рассмотрите покупку, но будьте осторожны - может быть коррекция.`;
            } else if (change > 0) {
                analysis += `↗️ <strong>Умеренный рост</strong>\n`;
                analysis += `💡 Возможны хорошие точки для входа.`;
            } else if (change > -2) {
                analysis += `↙️ <strong>Небольшое снижение</strong>\n`;
                analysis += `💡 Рынок в неопределенности, ждите четких сигналов.`;
            } else {
                analysis += `📉 <strong>Сильное снижение</strong>\n`;
                analysis += `💡 Будьте осторожны, возможна дальнейшая просадка.`;
            }
            
            return analysis;
        }
    },

    // Ответы на вопросы
    answers: {
        'что такое': {
            'трейдинг': 'Трейдинг - это покупка и продажа активов с целью получения прибыли от изменения их цены! 📈',
            'биткоин': 'Биткоин (BTC) - первая и самая известная криптовалюта. Используется как цифровое золото! ฿',
            'эфириум': 'Эфириум (ETH) - платформа для смарт-контрактов и dApps. Вторая по капитализации криптовалюта! ⟠',
            'криптовалюта': 'Криптовалюта - цифровые деньги на основе блокчейна. Децентрализованы и защищены криптографией! 🔐'
        },
        'как': {
            'начать': 'Начните с изучения графика, затем совершите первую сделку на небольшую сумму! 🎯',
            'заработать': 'Покупайте дешевле, продавайте дороже! Но помните - всегда есть риски. 💰',
            'анализировать': 'Изучайте тренды, объемы торгов и используйте технические индикаторы! 📊'
        },
        'что': {
            'лучше': 'Лучше начать с BTC или ETH - они более стабильны чем альткоины! ⚖️',
            'риск': 'Риск есть всегда! Никогда не инвестируйте больше чем можете позволить себе потерять! 🛡️'
        }
    },

    // Советы
    tips: [
        "💡 Начинайте с демо-счета прежде чем торговать на реальные деньги!",
        "🎯 Рискуйте не более 2% от депозита в одной сделке!",
        "📚 Изучайте технический анализ - это основа успешного трейдинга!",
        "🛡️ Всегда используйте стоп-лосс для ограничения убытков!",
        "💪 Контролируйте эмоции - жадность и страх главные враги трейдера!",
        "📊 Ведите торговый журнал для анализа своих ошибок и успехов!"
    ],

    // Генерация ответа на вопрос
    getAnswer: function(question) {
        question = question.toLowerCase();
        
        // Приветствия
        if (question.includes('привет') || question.includes('здравств')) {
            return this.greetings[Math.floor(Math.random() * this.greetings.length)];
        }
        
        // Благодарности
        if (question.includes('спасибо') || question.includes('благодар')) {
            return "Всегда рад помочь! 🎉 Продолжайте обучение - каждый шаг приближает вас к успеху!";
        }
        
        // Поиск в базе ответов
        for (const [key, answers] of Object.entries(this.answers)) {
            if (question.includes(key)) {
                for (const [term, answer] of Object.entries(answers)) {
                    if (question.includes(term)) {
                        return answer;
                    }
                }
            }
        }
        
        // Случайный совет если вопрос не распознан
        return this.tips[Math.floor(Math.random() * this.tips.length)];
    }
};

// ИИ-помощник
class AITeacher {
    constructor() {
        this.currentStep = 1;
        this.isTyping = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Быстрые действия
        document.querySelectorAll('.ai-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Шаги обучения
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNum = parseInt(e.currentTarget.dataset.step);
                this.showTutorialStep(stepNum);
            });
        });

        // Чат с ИИ
        document.getElementById('send-ai-message').addEventListener('click', () => {
            this.processUserMessage();
        });

        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processUserMessage();
        });

        // Всплывающий помощник
        document.getElementById('ai-helper').addEventListener('click', () => {
            this.showContextHelp();
        });

        // Автоматические подсказки при переходе по разделам
        this.setupSectionHelp();
    }

    setupSectionHelp() {
        // Следим за переходами между разделами
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active')) {
                        this.showSectionIntroduction(target.id);
                    }
                }
            });
        });

        document.querySelectorAll('.content-section').forEach(section => {
            observer.observe(section, { attributes: true });
        });
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addAIMessage("Добро пожаловать в TradeLearn! 🎉 Я ваш ИИ-помощник, который проведет вас через все этапы обучения трейдингу. Давайте начнем!");
        }, 1000);
    }

    handleQuickAction(action) {
        switch(action) {
            case 'explain-chart':
                this.explainChart();
                break;
            case 'explain-trading':
                this.explainTrading();
                break;
            case 'explain-portfolio':
                this.explainPortfolio();
                break;
            case 'analyze-current':
                this.analyzeCurrentChart();
                break;
        }
    }

    explainChart() {
        this.addAIMessage(aiTeacher.explanations.chart);
        this.showTutorialStep(1);
    }

    explainTrading() {
        this.addAIMessage(aiTeacher.explanations.trading);
        this.showTutorialStep(2);
    }

    explainPortfolio() {
        this.addAIMessage(aiTeacher.explanations.portfolio);
        this.showTutorialStep(3);
    }

    analyzeCurrentChart() {
        if (window.currentData && window.currentData.length > 1) {
            const currentPrice = window.currentData[window.currentData.length - 1].close;
            const prevPrice = window.currentData[window.currentData.length - 2].close;
            const change = ((currentPrice - prevPrice) / prevPrice) * 100;
            
            this.addAIMessage(aiTeacher.explanations.analyze(currentPrice, change));
        } else {
            this.addAIMessage("Сначала загрузите график для анализа! 📊");
        }
    }

    showTutorialStep(step) {
        // Обновляем визуальное отображение шагов
        document.querySelectorAll('.tutorial-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        
        const currentStepEl = document.querySelector(`[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        this.currentStep = step;
        
        // Показываем сообщение для шага
        const stepMessages = {
            1: "Отлично! Давайте изучим график. Обратите внимание на японские свечи - они показывают движение цены за выбранный период.",
            2: "Прекрасно! Теперь давайте разберемся с торговлей. Помните - начинайте с малых сумм!",
            3: "Замечательно! Теперь вы знаете как следить за своими инвестициями. Не забывайте диверсифицировать портфель!"
        };

        if (stepMessages[step]) {
            this.addAIMessage(stepMessages[step]);
        }
    }

    showSectionIntroduction(sectionId) {
        const introductions = {
            'teacher-section': "Здесь я буду вашим проводником в мире трейдинга! Задавайте любые вопросы! 🎓",
            'trading-section': "Время практики! Совершите свою первую сделку. Не волнуйтесь - это демо-режим! ⚡",
            'portfolio-section': "Здесь вы видите все ваши активы. Следите за изменениями стоимости! 💼",
            'chart-section': "Изучайте графики, находите паттерны, принимайте взвешенные решения! 📊"
        };

        if (introductions[sectionId]) {
            this.addAIMessage(introductions[sectionId]);
        }
    }

    processUserMessage() {
        if (this.isTyping) return;

        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Показываем сообщение пользователя
        this.addUserMessage(message);
        input.value = '';

        // Имитация задержки ответа ИИ
        this.isTyping = true;
        setTimeout(() => {
            const response = aiTeacher.getAnswer(message);
            this.addAIMessage(response);
            this.isTyping = false;
        }, 1000 + Math.random() * 1000);
    }

    addAIMessage(message) {
        const chatContainer = document.getElementById('ai-chat-messages');
        const messageElement = this.createMessageElement(message, 'bot');
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Также обновляем основное сообщение учителя
        document.getElementById('teacher-message').innerHTML = message.replace(/\n/g, '<br>');
    }

    addUserMessage(message) {
        const chatContainer = document.getElementById('ai-chat-messages');
        const messageElement = this.createMessageElement(message, 'user');
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    createMessageElement(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${type}`;
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content" style="margin-left: auto; background: var(--primary); color: white;">${message}</div>
                <div class="message-avatar">👤</div>
            `;
        }
        
        return messageDiv;
    }

    showContextHelp() {
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection) {
            const sectionId = currentSection.id;
            this.showSectionIntroduction(sectionId);
        }
    }
}

// Интеграция с существующим кодом
// В функции initializeApp() добавьте:
function initializeAITeacher() {
    window.aiTeacher = new AITeacher();
}

// В setupEventListeners() добавьте вызов:
// initializeAITeacher();

// Также обновите функцию executeTrade() чтобы ИИ комментировал сделки:
function executeTrade(type) {
    // ... ваш существующий код ...
    
    // После успешной сделки добавляем комментарий ИИ
    setTimeout(() => {
        const messages = {
            'buy': [
                "Отличная покупка! 🎯 Теперь следите за графиком чтобы вовремя зафиксировать прибыль!",
                "Поздравляю с покупкой! 📈 Помните про стоп-лосс для защиты от неожиданных движений!",
                "Удачная сделка! 💪 Не забывайте контролировать риски!"
            ],
            'sell': [
                "Хорошая продажа! 🎯 Теперь можно ждать более выгодной цены для повторной покупки!",
                "Отличное решение! 📉 Фиксация прибыли - важный навык успешного трейдера!",
                "Умная сделка! 💰 Вы грамотно управляете своими инвестициями!"
            ]
        };
        
        const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];
        if (window.aiTeacher) {
            window.aiTeacher.addAIMessage(randomMessage);
        }
    }, 500);
}

// Инициализируем ИИ-учителя когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    // ... ваш существующий код ...
    
    // Добавляем инициализацию ИИ
    setTimeout(() => {
        initializeAITeacher();
    }, 2000);
});
