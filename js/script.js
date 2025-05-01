/**
 * GERENCIADOR PRINCIPAL DA APLICAÇÃO
 * 
 * Este script controla:
 * - Sistema de carrossel
 * - Troca de idiomas
 * - Reservas online
 * - Gerenciamento de cookies */

document.addEventListener('DOMContentLoaded', function() {
    initCarousel();       // Inicializa o carrossel de imagens
    setMinDate();         // Configura data mínima para reservas
    initReservations();   // Configura sistema de reservas
    initLanguage();       // Configura sistema de idiomas
    initCookies();        // Configura gerenciamento de cookies
    
    // Atualiza o ano no footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// ==================== CARROSSEL ====================
/**
 * Inicializa e configura o carrossel Bootstrap
 * - Define intervalo de transição automática
 * - Ajusta velocidade da transição
 * - Configura indicadores de navegação
 */
function initCarousel() {
    const carousel = document.getElementById('mainCarousel');
    if (!carousel) return;

    const myCarousel = new bootstrap.Carousel(carousel, {
        interval: 4500,
        ride: 'carousel',
        pause: 'hover',
        wrap: true
    });

    // Ajusta velocidade da transição
    const style = document.createElement('style');
    style.innerHTML = `.carousel-item { transition: transform 0.6s ease-in-out; }`;
    document.head.appendChild(style);

    // Atualiza indicadores ativos
    carousel.addEventListener('slid.bs.carousel', function(event) {
        const activeIndex = event.to;
        document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    });

    // Configura navegação pelos indicadores
    document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
        indicator.addEventListener('click', () => myCarousel.to(index));
    });
}

// ==================== RESERVAS ====================
/**
 * Sistema de reservas
 * - Valida formulário
 * - Salva dados localmente
 * - Integra com EmailJS para envio
 */

function setMinDate() {
    const dataInput = document.getElementById('data-reserva');
    if (!dataInput) return;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dataInput.min = tomorrow.toISOString().split('T')[0];
    dataInput.value = dataInput.min;
}

function initReservations() {
    const form = document.getElementById('formulario-reserva-simples');
    if (!form) return;
    
    loadSavedReservation();
    form.addEventListener('submit', handleReservationSubmit);
}

function loadSavedReservation() {
    try {
        const savedData = JSON.parse(localStorage.getItem('reserva')) || {};
        const fieldMap = {
            'data-reserva': 'data',
            'horario-reserva': 'horario',
            'pessoas-reserva': 'pessoas',
            'contato-reserva': 'contato',
            'observacoes-reserva': 'observacoes'
        };

        Object.entries(fieldMap).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element && id !== 'data-reserva') {
                element.value = savedData[key] || '';
            }
        });
    } catch (error) {
        console.error('Erro ao carregar reserva:', error);
    }
}

function handleReservationSubmit(event) {
    event.preventDefault();
    
    const formData = {
        data: document.getElementById('data-reserva').value,
        horario: document.getElementById('horario-reserva').value,
        pessoas: document.getElementById('pessoas-reserva').value,
        contato: document.getElementById('contato-reserva').value.trim(),
        observacoes: document.getElementById('observacoes-reserva').value
    };
    
    // Validação
    if (!Object.values(formData).every(Boolean)) {
        showError('Preencha todos os campos obrigatórios');
        return;
    }

    if (!isValidContact(formData.contato)) {
        showError('Formato de contato inválido');
        return;
    }

    saveReservation(formData);
    sendReservation(formData);
}

function saveReservation(data) {
    localStorage.setItem('reserva', JSON.stringify(data));
}

function sendReservation(data) {
    if (!hasConsent()) {
        showError('É necessário aceitar os termos de uso');
        return;
    }

    const emailData = {
        serviceID: 'service_yyjfkzr',
        templateID: 'template_0wcvrsf',
        userID: 'cS_tnL5sB4USBKOqM',
        templateParams: {
            data_reserva: formatDate(data.data),
            horario_reserva: data.horario,
            numero_pessoas: data.pessoas,
            contato_cliente: data.contato,
            observacoes: data.observacoes || 'Nenhuma observação'
        }
    };

    emailjs.send(emailData.serviceID, emailData.templateID, emailData.templateParams, emailData.userID)
        .then(() => {
            showSuccess('Reserva enviada com sucesso!');
            document.getElementById('formulario-reserva-simples').reset();
            setMinDate();
        })
        .catch(error => {
            console.error('Erro ao enviar reserva:', error);
            showError('Erro ao enviar reserva. Tente novamente.');
        });
}

// ==================== COOKIES ====================
/**
 * Sistema de consentimento de cookies
 * - Exibe banner quando necessário
 * - Gerencia preferências do usuário
 * - Carrega scripts de analytics quando permitido
 */

function initCookies() {
    const banner = document.getElementById('cookieConsent');
    if (!banner) return;
    
    if (!localStorage.getItem('cookieConsent')) {
        banner.classList.remove('d-none');
    }
    
    document.getElementById('acceptCookies')?.addEventListener('click', acceptCookies);
    document.getElementById('rejectCookies')?.addEventListener('click', rejectCookies);
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieConsent').classList.add('d-none');
    loadAnalytics();
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.getElementById('cookieConsent').classList.add('d-none');
}

function loadAnalytics() {
    if (localStorage.getItem('cookieConsent') !== 'accepted') return;
    
    // Implementação do Google Analytics (substitua pelo seu ID)
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y';
    script.async = true;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'UA-XXXXX-Y');
}

// ==================== FUNÇÕES AUXILIARES ====================

function hasConsent() {
    return localStorage.getItem('cookieConsent') === 'accepted';
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) return decodeURIComponent(cookieValue);
    }
    return null;
}

function showError(message) {
    // Implemente sua lógica de exibição de erros
    console.error(message);
}

function showSuccess(message) {
    // Implemente sua lógica de exibição de sucesso
    console.log(message);
}

function isValidContact(contact) {
    // Implemente sua validação de contato
    return contact.length > 0;
}

function formatDate(dateString) {
    // Implemente sua formatação de data
    return dateString;
}