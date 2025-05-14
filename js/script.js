/**
 * GERENCIADOR PRINCIPAL DA APLICAÇÃO
 * 
 * Controla todas as funcionalidades do website:
 * - Carrossel de imagens
 * - Sistema multilíngue
 * - Reservas online
 * - Gerenciamento de cookies
 * - Integração com EmailJS
 */

class VanguardaApp {
    constructor() {
        this.emailjsConfig = {
            serviceId: 'vanguardarestaurante',
            templateId: 'template_0wcvrsf',
            publicKey: 'bgzlZg7gKR3oDk8Bf'
        };
        
        this.init();
    }

    /**
     * Inicialização principal da aplicação
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initCarousel();
            this.initLanguage();
            this.initCookies();
            this.initReservations();
            this.updateCurrentYear();
        });
    }

    /**
     * Atualiza o ano no footer
     */
    updateCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ==================== SISTEMA DE CARROSSEL ====================
    initCarousel() {
        const carousel = document.getElementById('mainCarousel');
        if (!carousel) return;

        // Verifica se Bootstrap está disponível
        if (typeof bootstrap?.Carousel === 'undefined') {
            console.error('Bootstrap Carousel não carregado');
            return;
        }

        try {
            const myCarousel = new bootstrap.Carousel(carousel, {
                interval: 4500,
                ride: 'carousel',
                pause: 'hover',
                wrap: true
            });

            // Otimização de performance para animações
            requestAnimationFrame(() => {
                const style = document.createElement('style');
                style.innerHTML = `.carousel-item { transition: transform 0.6s ease-in-out; }`;
                document.head.appendChild(style);
            });

            // Atualiza indicadores ativos
            carousel.addEventListener('slid.bs.carousel', (event) => {
                const activeIndex = event.to;
                document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === activeIndex);
                });
            });

            // Configura navegação
            document.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator, index) => {
                indicator.addEventListener('click', () => myCarousel.to(index));
            });

        } catch (error) {
            console.error('Erro ao inicializar carrossel:', error);
        }
    }

    // ==================== SISTEMA DE IDIOMAS ====================
    initLanguage() {
        try {
            const languageSwitcher = document.getElementById('language-switcher');
            if (!languageSwitcher) {
                console.warn('Seletor de idioma não encontrado');
                return;
            }

            languageSwitcher.addEventListener('change', (e) => {
                const lang = e.target.value;
                this.changeLanguage(lang);
            });

            // Carrega idioma salvo ou padrão
            const savedLang = localStorage.getItem('appLanguage') || 'pt';
            languageSwitcher.value = savedLang;
            this.changeLanguage(savedLang);

        } catch (error) {
            console.error('Erro no sistema de idiomas:', error);
        }
    }

    changeLanguage(lang) {
        // Implemente a mudança de idioma aqui
        console.log('Idioma alterado para:', lang);
        localStorage.setItem('appLanguage', lang);
    }

    // ==================== SISTEMA DE RESERVAS ====================
    initReservations() {
        try {
            // Configura date picker
            this.setupDatePicker();
            
            // Inicializa EmailJS
            this.initializeEmailService().then(() => {
                const form = document.getElementById('formulario-reserva-simples');
                if (form) {
                    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
                }
            });

        } catch (error) {
            console.error('Erro ao inicializar reservas:', error);
            this.showAlert('error', 'Sistema de reservas temporariamente indisponível');
        }
    }

    async initializeEmailService() {
        if (typeof emailjs === 'undefined') {
            throw new Error('Biblioteca EmailJS não carregada');
        }

        try {
            await emailjs.init(this.emailjsConfig.publicKey);
            console.log('EmailJS inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Falha na inicialização do EmailJS:', error);
            throw error;
        }
    }

    setupDatePicker() {
        const dateInput = document.getElementById('data-reserva');
        if (!dateInput) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        dateInput.min = tomorrow.toISOString().split('T')[0];
        dateInput.value = '';
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        try {
            const formData = this.getFormData();
            this.validateFormData(formData);
            
            await this.sendReservation(formData);
            
            this.showAlert('success', 'Reserva confirmada! Verifique seu email.');
            event.target.reset();
            this.setupDatePicker();

        } catch (error) {
            this.showAlert('error', error.message);
        }
    }

    getFormData() {
        return {
            data: document.getElementById('data-reserva').value,
            horario: document.getElementById('horario-reserva').value,
            pessoas: document.getElementById('pessoas-reserva').value,
            contato: document.getElementById('contato-reserva').value.trim(),
            observacoes: document.getElementById('observacoes-reserva')?.value || ''
        };
    }

    validateFormData(formData) {
        if (!formData.data || !formData.horario || !formData.contato) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        if (!this.isValidEmail(formData.contato)) {
            throw new Error('Por favor, insira um email válido');
        }
    }

    async sendReservation(formData) {
        if (typeof emailjs === 'undefined') {
            throw new Error('Serviço de email não disponível');
        }

        const templateParams = {
            nome: formData.contato.split('@')[0] || 'Cliente',
            data: this.formatDate(formData.data),
            horario: formData.horario,
            pessoas: formData.pessoas,
            contato: formData.contato,
            observacoes: formData.observacoes || 'Nenhuma observação'
        };

        try {
            const response = await emailjs.send(
                this.emailjsConfig.serviceId,
                this.emailjsConfig.templateId,
                templateParams
            );

            if (response.status !== 200) {
                throw new Error('Erro no envio da reserva');
            }

            return response;
        } catch (error) {
            console.error('Erro no envio:', error);
            throw new Error('Falha ao enviar reserva. Tente novamente.');
        }
    }

    // ==================== GERENCIAMENTO DE COOKIES ====================
    initCookies() {
        try {
            const banner = document.getElementById('cookieConsent');
            if (!banner) return;
            
            if (!localStorage.getItem('cookieConsent')) {
                banner.classList.remove('d-none');
            }
            
            document.getElementById('acceptCookies')?.addEventListener('click', () => this.acceptCookies());
            document.getElementById('rejectCookies')?.addEventListener('click', () => this.rejectCookies());

        } catch (error) {
            console.error('Erro no sistema de cookies:', error);
        }
    }

    acceptCookies() {
        localStorage.setItem('cookieConsent', 'accepted');
        document.getElementById('cookieConsent').classList.add('d-none');
        this.loadAnalytics();
    }

    rejectCookies() {
        localStorage.setItem('cookieConsent', 'rejected');
        document.getElementById('cookieConsent').classList.add('d-none');
    }

    loadAnalytics() {
        if (localStorage.getItem('cookieConsent') !== 'accepted') return;
        
        // Implementação do Google Analytics
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y';
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', 'UA-XXXXX-Y');
    }

    // ==================== UTILITÁRIOS ====================
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-PT', options);
    }

    showAlert(type, message) {
        // Implementação melhorada de alertas
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fixed-top mt-3 mx-auto w-75`;
        alertDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${type === 'success' ? '✅' : '❌'} ${message}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Inicializa a aplicação
const app = new VanguardaApp();