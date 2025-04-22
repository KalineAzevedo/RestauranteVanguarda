document.addEventListener('DOMContentLoaded', function() {
    // 1. Configuração do Carousel
    initCarousel();
    
    // 2. Menu Mobile (descomente se necessário)
    // initMobileMenu();
    
    // 3. Configurações de Reserva
    setMinDate();
    initReservations();
});

// Carousel com transição ajustada
function initCarousel() {
    const carousel = document.getElementById('mainCarousel');
    if (!carousel) return;

    const myCarousel = new bootstrap.Carousel(carousel, {
        interval: 4500,
        ride: 'carousel',
        pause: 'hover',
        wrap: true
    });

    // Configura a velocidade da transição
    const style = document.createElement('style');
    style.innerHTML = `
        .carousel-item {
            transition: transform 0.6s ease-in-out; 
        }
    `;
    document.head.appendChild(style);

    // Atualiza indicadores quando o slide muda
    carousel.addEventListener('slid.bs.carousel', function(event) {
        const activeIndex = event.to;
        document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    });

    // Navegação pelos indicadores (bolinhas)
    document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            myCarousel.to(index);
        });
    });
}

// Função de menu mobile (descomente se necessário)
/*
function initMobileMenu() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (!navbarCollapse) return;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                navbarCollapse.classList.remove('show');
            }
        });
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => navbarCollapse.classList.remove('show'));
    navbarCollapse.appendChild(closeBtn);
}
*/

// Funções de reserva
function setMinDate() {
    const dataInput = document.getElementById('data-reserva');
    if (dataInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Reservas a partir de amanhã
        const minDate = today.toISOString().split('T')[0];
        dataInput.min = minDate;
        dataInput.value = minDate;
    }
}

function initReservations() {
    const formReserva = document.getElementById('formulario-reserva-simples');
    if (!formReserva) return;

    loadSavedReservation();
    formReserva.addEventListener('submit', handleReservationSubmit);
}

function loadSavedReservation() {
    try {
        const dadosSalvos = JSON.parse(localStorage.getItem('reserva')) || {};
        const fields = {
            'data-reserva': 'data',
            'horario-reserva': 'horario',
            'pessoas-reserva': 'pessoas',
            'contato-reserva': 'contato',
            'observacoes-reserva': 'observacoes'
        };

        Object.keys(fields).forEach(id => {
            const element = document.getElementById(id);
            if (element && id !== 'data-reserva') {
                element.value = dadosSalvos[fields[id]] || '';
            }
        });
    } catch (error) {
        console.error('Erro ao carregar reserva:', error);
    }
}

function handleReservationSubmit(event) {
    event.preventDefault();
    
    const data = document.getElementById('data-reserva').value;
    const horario = document.getElementById('horario-reserva').value;
    const pessoas = document.getElementById('pessoas-reserva').value;
    const contato = document.getElementById('contato-reserva').value.trim();
    const observacoes = document.getElementById('observacoes-reserva').value;
    
    // Limpar mensagens anteriores
    const oldMessage = document.querySelector('.alert');
    if (oldMessage) oldMessage.remove();
    
    const mensagem = document.createElement('div');
    mensagem.className = 'alert mt-3';
    event.target.appendChild(mensagem);

    // Validação
    if (!data || !horario || !pessoas || !contato) {
        showError(mensagem, 'campos-obrigatorios');
        return;
    }

    if (!isValidContact(contato)) {
        showError(mensagem, 'contato-invalido');
        return;
    }

    saveReservation(data, horario, pessoas, contato, observacoes);
    sendReservationEmail(data, horario, pessoas, contato, observacoes, mensagem);
}

function saveReservation(data, horario, pessoas, contato, observacoes) {
    localStorage.setItem('reserva', JSON.stringify({ 
        data, 
        horario, 
        pessoas, 
        contato, 
        observacoes 
    }));
}

function sendReservationEmail(data, horario, pessoas, contato, observacoes, mensagem) {
    // Verificar consentimento antes de processar dados pessoais
    if (!hasMarketingConsent()) {
        showError(mensagem, 'consentimento-necessario');
        return Promise.resolve(); // Retorna uma promise vazia para evitar erros
    }

    const serviceID = 'service_yyjfkzr';
    const templateID = 'template_0wcvrsf';
    const userID = 'cS_tnL5sB4USBKOqM';
    
    console.log('Enviando email com:', {
        serviceID,
        templateID,
        data: {
            data_reserva: formatDate(data),
            horario_reserva: horario,
            numero_pessoas: pessoas,
            contato_cliente: contato,
            observacoes: observacoes || 'Nenhuma observação'
        }
    });

    return emailjs.send(serviceID, templateID, {
        data_reserva: formatDate(data),
        horario_reserva: horario,
        numero_pessoas: pessoas,
        contato_cliente: contato,
        observacoes: observacoes || 'Nenhuma observação'
    }, userID)
    .then((response) => {
        console.log('Sucesso:', response);
        showSuccess(mensagem, data, horario, pessoas);
        document.getElementById('formulario-reserva-simples').reset();
        setMinDate();
        return response;
    })
    .catch((error) => {
        console.error('Erro:', error);
        showError(mensagem, 'erro-envio', error.text);
        throw error; // Propaga o erro para quem chamou a função
    });
}

// Adicione estas funções auxiliares para gerenciar consentimento
function hasMarketingConsent() {
    // Verifica tanto localStorage quanto cookies para maior robustez
    const consent = localStorage.getItem('cookieConsent') || getCookie('cookieConsent');
    return consent === 'accepted'; // Retorna true apenas se consentimento explícito
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) return decodeURIComponent(cookieValue);
    }
    return null;
}