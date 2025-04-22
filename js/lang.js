// Definição das traduções 
const translations = {
    pt: {
        "nav-home": "Início",
        "nav-menu": "Menu",
        "nav-especialidades": "Especialidades",
        "nav-menu-grupos": "Menu para Grupos",
        "nav-reservas": "Reservas",
        "reserva-titulo": "Reserve Online",
        "reserva-data": "Escolha uma Data:",
        "reserva-horario": "Horário:",
        "reserva-pessoas": "Número de Pessoas:",
        "reserva-contato": "Contato:",
        "reserva-observacoes": "Observações:",
        "reserva-botao": "Reserva",
        "reserva-info-text": "Aberto todos os dias ao jantar,<br>das 18h às 22h.",
        "reserva-info-btn": "Faça sua Reserva",
        "historia-titulo": "Uma Jornada de Sabores e Tradição.",
        "historia-texto1": "Fundado em 1995 pelo renomado chef Eduardo Mendes, o Restaurante Vanguarda nasceu da paixão por unir tradição e inovação. Localizado no coração de Porto, o restaurante rapidamente se tornou um marco na cena gastronômica portuguesa, celebrando a rica herança culinária do país enquanto abraçava técnicas modernas e ingredientes de alta qualidade.",
        "historia-texto2": "O nome 'Vanguarda' reflete nossa missão de estar sempre à frente, explorando novos horizontes sem perder de vista nossas raízes. Cada prato é uma homenagem à cultura portuguesa, com toques contemporâneos que surpreendem e encantam. Nossa equipe, liderada pelo chef Mendes, dedica-se a criar experiências memoráveis, onde cada detalhe é cuidadosamente planejado para proporcionar uma jornada única de sabores.",
        "historia-texto3": "Ao longo dos anos, o Restaurante Vanguarda recebeu inúmeros prêmios e reconhecimentos, mas nosso maior orgulho é o sorriso de satisfação de nossos clientes. Venha nos visitar e faça parte dessa história que continua a ser escrita a cada dia, com paixão, dedicação e muito sabor.",
        "historia-btn": "Faça Parte da Nossa História",
        "footer-endereco": "Endereço: Rua da Alegria, 123 - Porto, Portugal",
        "footer-contato": "Contacto: 999 999 999",
        "cookie-accept-all": "Aceitar Todos",
        "cookie-essential-only": "Apenas Necessários",
    },
    en: {
        "nav-home": "Home",
        "nav-menu": "Menu",
        "nav-especialidades": "Specialties",
        "nav-menu-grupos": "Group Menu",
        "nav-reservas": "Reservations",
        "reserva-titulo": "Book Online",
        "reserva-data": "Choose a Date:",
        "reserva-horario": "Time:",
        "reserva-pessoas": "Number of People:",
        "reserva-contato": "Contact:",
        "reserva-observacoes": "Remarks:",
        "reserva-botao": "Book Now",
        "reserva-info-text": "Open every day for dinner,<br>from 6 PM to 10 PM.",
        "reserva-info-btn": "Make Your Reservation",
        "historia-titulo": "A Journey of Flavors and Tradition.",
        "historia-texto1": "Founded in 1995 by renowned chef Eduardo Mendes, Restaurante Vanguarda was born from a passion for combining tradition and innovation. Located in the heart of Porto, the restaurant quickly became a landmark in the Portuguese gastronomic scene, celebrating the country's rich culinary heritage while embracing modern techniques and high-quality ingredients.",
        "historia-texto2": "The name 'Vanguarda' reflects our mission to always be ahead, exploring new horizons without losing sight of our roots. Each dish is a tribute to Portuguese culture, with contemporary touches that surprise and delight. Our team, led by Chef Mendes, is dedicated to creating memorable experiences, where every detail is carefully planned to provide a unique journey of flavors.",
        "historia-texto3": "Over the years, Restaurante Vanguarda has received numerous awards and recognitions, but our greatest pride is the smile of satisfaction from our customers. Come visit us and be part of this story that continues to be written every day, with passion, dedication, and lots of flavor.",
        "historia-btn": "Be Part of Our History",
        "footer-endereco": "Address: Rua da Alegria, 123 - Porto, Portugal",
        "footer-contato": "Contact: 999 999 999",
        "footer-redes": "<a href='#' class='text-white'><i class='fab fa-instagram'></i> Instagram</a> | <a href='#' class='text-white'><i class='fab fa-facebook'></i> Facebook</a> | <a href='https://wa.me/11234567890' class='text-white' target='_blank'><i class='fab fa-whatsapp'></i> WhatsApp</a>",
        "consentimento-necessario": "Please accept marketing cookies to submit your reservation",
        "cookie-banner-text": "We use cookies to enhance your experience. <a href='politica-cookies.html'>Learn more</a>",
        "cookie-accept-all": "Accept All",
        "cookie-essential-only": "Essential Only",
    
    },
};

// Espera a página carregar e aplica o idioma salvo
document.addEventListener("DOMContentLoaded", function () {
    const savedLanguage = localStorage.getItem("language") || "pt";
    changeLanguage(savedLanguage);
});

function changeLanguage(lang) {
    // Salva o idioma selecionado
    localStorage.setItem("language", lang);
    
    // Atualiza a classe ativa nos seletores de idioma
    document.querySelectorAll('.language').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(lang).classList.add('active');

    // Atualiza todos os elementos com IDs correspondentes
    Object.keys(translations[lang]).forEach(key => {
        const elements = document.querySelectorAll(`[id="${key}"]`);
        elements.forEach(element => {
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                element.placeholder = translations[lang][key];
            } else {
                element.innerHTML = translations[lang][key];
            }
        });
    });

    // Atualiza elementos específicos que não usam IDs
    updateNonIdElements(lang);
}

function updateNonIdElements(lang) {
    // Seção de reservas
    const reservaInfoText = document.querySelector(".reserva-info p");
    if (reservaInfoText && translations[lang]["reserva-info-text"]) {
        reservaInfoText.innerHTML = translations[lang]["reserva-info-text"];
    }

    const reservaInfoBtn = document.querySelector("#abrir-formulario");
    if (reservaInfoBtn && translations[lang]["reserva-info-btn"]) {
        reservaInfoBtn.innerText = translations[lang]["reserva-info-btn"];
    }

    // Footer
    const footerElements = {
        "footer-endereco": "footer p:nth-of-type(1)",
        "footer-contato": "footer p:nth-of-type(2)",
        "footer-redes": "footer p:nth-of-type(3)"
    };

    Object.entries(footerElements).forEach(([key, selector]) => {
        const element = document.querySelector(selector);
        if (element && translations[lang][key]) {
            if (key === "footer-redes") {
                element.innerHTML = translations[lang][key];
            } else {
                element.innerText = translations[lang][key];
            }
        }
    });
}

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    const savedLanguage = localStorage.getItem("language") || "pt";
    changeLanguage(savedLanguage);
    
    // Adiciona eventos de clique aos seletores de idioma
    document.getElementById('pt').addEventListener('click', () => changeLanguage('pt'));
    document.getElementById('en').addEventListener('click', () => changeLanguage('en'));
});