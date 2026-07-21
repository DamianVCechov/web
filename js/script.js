// Reference na elementy v DOM
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");

// Načtení všech stránek do pole
const pages = [
    document.querySelector("#p1"),
    document.querySelector("#p2"),
    document.querySelector("#p3"),
    document.querySelector("#p4"),
    document.querySelector("#p5"),
    document.querySelector("#p6"),
    document.querySelector("#p7"),
    document.querySelector("#p8")
];

// Stavové proměnné
let currentState = 1;
const numOfPapers = pages.length;
const maxState = numOfPapers + 1;

// Proměnné pro sledování gest na mobilu
let touchStartX = 0;
let touchEndX = 0;

// Pomocná funkce pro zjištění, zda se jedná o mobilní zobrazení
function isMobile() {
    return window.innerWidth <= 768;
}

// Inicializace z-indexů na začátku (první strana navrchu)
function initZIndexes() {
    for (let i = 0; i < pages.length; i++) {
        pages[i].style.zIndex = numOfPapers - i;
        if (i === 0) {
            pages[i].style.pointerEvents = "auto";
        } else {
            pages[i].style.pointerEvents = "none";
        }
    }
}

// Funkce pro adaptivní posun knihy
function openBook() {
    if (isMobile()) {
        // Na mobilu začínáme otevření pohledem na levou (nově odhalenou) stranu
        book.style.transform = "translateX(0%)";
        book.style.left = "80vw"; 
    } else {
        book.style.transform = "translateX(50%)";
    }
}

function closeBook(isAtStart) {
    if (isMobile()) {
        book.style.transform = "translateX(0%)";
        // Pokud jsme na začátku (přední obálka) i na konci (zadní obálka), vynulujeme posun vlevo
        book.style.left = "0px";
    } else {
        if (isAtStart) {
            book.style.transform = "translateX(0%)";
        } else {
            book.style.transform = "translateX(100%)";
        }
    }
}

function updatePointerEvents() {
    pages.forEach(page => {
        page.style.pointerEvents = "none";
    });

    if (currentState === 1) {
        pages[0].style.pointerEvents = "auto";
    } else if (currentState === maxState) {
        pages[numOfPapers - 1].style.pointerEvents = "auto";
    } else {
        pages[currentState - 2].style.pointerEvents = "auto";
        pages[currentState - 1].style.pointerEvents = "auto";
    }
}

function goNextPage() {
    if (currentState < maxState) {
        if (currentState === 1) {
            openBook();
        } else if (isMobile() && currentState < numOfPapers) {
            book.style.left = "80vw";
        }

        const currentPaper = pages[currentState - 1];
        currentPaper.classList.remove("unflipped");
        currentPaper.classList.add("flipped");
        
        setTimeout(() => {
            currentPaper.style.zIndex = currentState;
        }, 700);

        if (currentState === numOfPapers) {
            closeBook(false);
        }

        currentState++;
        updatePointerEvents();
    }
}

function goPrevPage() {
    if (currentState > 1) {
        if (currentState === maxState) {
            openBook();
        } else if (isMobile() && currentState > 2) {
            // UPRAVENO: Po kliknutí na levý list/Předchozí se fokus přesune na PRAVÝ list
            book.style.left = "0vw";
        }

        const currentPaper = pages[currentState - 2];
        currentPaper.classList.remove("flipped");
        currentPaper.classList.add("unflipped");

        setTimeout(() => {
            currentPaper.style.zIndex = numOfPapers - (currentState - 2);
        }, 700);

        if (currentState === 2) {
            closeBook(true);
        }

        currentState--;
        updatePointerEvents();
    }
}

// Event Listenery pro tlačítka
nextBtn.addEventListener("click", goNextPage);
prevBtn.addEventListener("click", goPrevPage);

// Umožní listovat i kliknutím přímo na aktivní listy
pages.forEach((page, index) => {
    page.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') return; 
        
        if (page.classList.contains("flipped")) {
            goPrevPage();
        } else {
            goNextPage();
        }
    });
});

// Detekce swipe pohybu pro ruční posun mezi levou a pravou stránkou
book.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

book.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    if (!isMobile() || currentState === 1 || currentState === maxState) return;

    const swipeDistance = touchEndX - touchStartX;
    const minSwipeThreshold = 20; 

    if (swipeDistance > minSwipeThreshold) {
        // Tah doprava -> ruční pohled na LEVÝ list knihy
        book.style.left = "80vw";
    } else if (swipeDistance < -minSwipeThreshold) {
        // Tah doleva -> ruční pohled na PRAVÝ list knihy
        book.style.left = "0vw";
    }
}

// Naslouchání na změnu velikosti okna
window.addEventListener("resize", () => {
    if (currentState > 1 && currentState < maxState) {
        openBook();
    } else {
        closeBook(currentState === 1);
    }
});

window.addEventListener("keydown", (e) => {
    // Mezerník nebo Šipka vpravo -> další strana
    if (e.code === "Space" || e.key === "ArrowRight") {
        e.preventDefault(); // Zamezí nechtěnému skrolování stránky dolů
        goNextPage();
    } 
    // Shift + Mezerník nebo Šipka vlevo -> předchozí strana
    else if ((e.code === "Space" && e.shiftKey) || e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevPage();
    }
});

// Zákaz kontextového menu (pravého tlačítka) na obrázcích
document.addEventListener("contextmenu", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

// Zákaz přetažení obrázku myší (drag & drop)
document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

// Spuštění inicializace
initZIndexes();
