// ==========================================
// 1. GESTION DE LA PAGE DE CONNEXION (index.html)
// ==========================================
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const footerToSignup = document.getElementById('footer-to-signup');
const footerToLogin = document.getElementById('footer-to-login');
const authTagline = document.getElementById('auth-tagline');

const btnShowSignup = document.getElementById('btn-show-signup');
const btnShowLogin = document.getElementById('btn-show-login');

// S'exécute uniquement si on est sur la page de connexion
if (btnShowSignup && btnShowLogin) {
    btnShowSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        footerToSignup.classList.add('hidden');
        
        signupForm.classList.remove('hidden');
        footerToLogin.classList.remove('hidden');
        authTagline.textContent = "Join your tribe and start tracking your puzzle pieces.";
    });

    btnShowLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        footerToLogin.classList.add('hidden');
        
        loginForm.classList.remove('hidden');
        footerToSignup.classList.remove('hidden');
        authTagline.textContent = "Manage your collection and find tribe trades.";
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chief = document.getElementById('signup-chief').value;
        const kingdom = document.getElementById('signup-kingdom').value;
        const tribe = document.getElementById('signup-tribe').value.toUpperCase();
        
        alert(`Welcome Chief ${chief} from Kingdom #${kingdom} [${tribe}]!\nYour test profile is ready.`);
    });
}

// ==========================================
// 2. BOUTON SHARE (Commun aux deux pages)
// ==========================================
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'PuzzleMatch for Viking Rise',
            text: 'Check out this awesome tool to track puzzles and organize trades within our tribe!',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share canceled or failed', err);
        }
    });
}

// ==========================================
// 3. MISE À JOUR GITHUB (Commun)
// ==========================================
async function fetchLastUpdateYear() {
    const username = 'amduskias-k754'; 
    const repo = 'NOM_DU_DEPOT';   
    const yearSpan = document.getElementById('last-update-year');
    if (!yearSpan) return;

    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=1`);
        if (response.ok) {
            const data = await response.json();
            const lastCommitDate = new Date(data[0].commit.author.date);
            yearSpan.textContent = lastCommitDate.getFullYear();
        }
    } catch (error) {
        console.log('Mode local ou API indisponible');
    }
}
fetchLastUpdateYear();

// ==========================================
// 4. TABLEAU DE BORD / GRIMOIRE (dashboard.html)
// ==========================================
const PUZZLES_CATALOG = [
    // Page 0 : Gold (6 puzzles)
    { id: "snowy-aurora", name: "Snowy Aurora Night", rarity: "gold", totalPieces: 28 },
    { id: "covenant-fate", name: "Covenant of Fate", rarity: "gold", totalPieces: 28 },
    { id: "floral-ocean", name: "Floral Ocean Glow", rarity: "gold", totalPieces: 28 },
    { id: "romantic-voyage", name: "Romantic Voyage", rarity: "gold", totalPieces: 28 },
    { id: "moonlight-ritual", name: "Moonlight Ritual", rarity: "gold", totalPieces: 28 },
    { id: "deer-woods", name: "Deer in the Woods", rarity: "gold", totalPieces: 28 },
    
    // Page 1 : Purple (6 puzzles)
    { id: "purple-1", name: "Harvest Caravan", rarity: "purple", totalPieces: 24 },
    { id: "purple-2", name: "Snow Wolf Pack", rarity: "purple", totalPieces: 24 },
    { id: "purple-3", name: "Whispering Shore", rarity: "purple", totalPieces: 24 },
    { id: "purple-4", name: "Bonfire Gala", rarity: "purple", totalPieces: 24 },
    { id: "purple-5", name: "Time of Celebration", rarity: "purple", totalPieces: 15 },
    { id: "purple-6", name: "Pastoral Banquet", rarity: "purple", totalPieces: 15 },

    // Page 2 : Blue (4 puzzles)
    { id: "blue-1", name: "Treasure Expedition", rarity: "blue", totalPieces: 15 },
    { id: "blue-2", name: "Hero's Adventure", rarity: "blue", totalPieces: 15 },
    { id: "blue-3", name: "Phantom Treasure", rarity: "blue", totalPieces: 15 },
    { id: "blue-4", name: "Starlight on Snow", rarity: "blue", totalPieces: 15 }
];

let userInventory = JSON.parse(localStorage.getItem('vr_user_inventory')) || {
    "snowy-aurora": { 1: 1 },
    "covenant-fate": { 4: 1 },
    "floral-ocean": { 1: 1, 2: 1, 3: 1 },
    "romantic-voyage": { 1: 1, 5: 1, 8: 1 },
    "moonlight-ritual": { 2: 1, 6: 1, 9: 1 },
    "deer-woods": { 1: 1, 2: 1, 3: 1 },
    "blue-1": { 1: 3, 2: 2 }
};

let currentSpread = 0; // 0 = Gold, 1 = Purple, 2 = Blue
const ITEMS_PER_SPREAD = 6;

function getPuzzleStats(puzzle) {
    const pieces = userInventory[puzzle.id] || {};
    let owned = 0;
    let duplicates = 0;

    for (let i = 1; i <= puzzle.totalPieces; i++) {
        const qty = pieces[i] || 0;
        if (qty >= 1) {
            owned++;
            duplicates += (qty - 1);
        }
    }
    return { owned, duplicates };
}

function renderDashboard() {
    const leftGrid = document.getElementById('left-page-grid');
    const rightGrid = document.getElementById('right-page-grid');
    if (!leftGrid || !rightGrid) return; // Sécurité si on est sur index.html

    leftGrid.innerHTML = '';
    rightGrid.innerHTML = '';

    const startIndex = currentSpread * ITEMS_PER_SPREAD;
    const pagePuzzles = PUZZLES_CATALOG.slice(startIndex, startIndex + ITEMS_PER_SPREAD);

    pagePuzzles.forEach((puzzle, index) => {
        const stats = getPuzzleStats(puzzle);
        const cardHTML = `
            <div class="puzzle-card ${puzzle.rarity}" onclick="openPuzzleModal('${puzzle.id}')">
                <span class="dup-badge">Available duplicates: ${stats.duplicates}</span>
                <div class="puzzle-art">
                    <span class="piece-count">${stats.owned}/${puzzle.totalPieces}</span>
                </div>
                <h3>${puzzle.name}</h3>
            </div>
        `;
        if (index < 3) {
            leftGrid.innerHTML += cardHTML;
        } else {
            rightGrid.innerHTML += cardHTML;
        }
    });

    const activeRarity = pagePuzzles[0] ? pagePuzzles[0].rarity : 'gold';
    let catOwned = 0, catTotal = 0, catDups = 0;
    let allOwned = 0, allTotal = 0, allDups = 0;

    PUZZLES_CATALOG.forEach(p => {
        const s = getPuzzleStats(p);
        allOwned += s.owned;
        allTotal += p.totalPieces;
        allDups += s.duplicates;

        if (p.rarity === activeRarity) {
            catOwned += s.owned;
            catTotal += p.totalPieces;
            catDups += s.duplicates;
        }
    });

    const catPercent = Math.round((catOwned / catTotal) * 100) || 0;
    const allPercent = Math.round((allOwned / allTotal) * 100) || 0;
    const rarityLabel = activeRarity.charAt(0).toUpperCase() + activeRarity.slice(1);

    const catEl = document.getElementById('category-stats');
    if (catEl) {
        catEl.className = `stat-badge ${activeRarity}`;
        catEl.innerHTML = `Progress ${rarityLabel}: <strong>${catOwned}/${catTotal} (${catPercent}%)</strong> &bull; Available duplicates: <strong>${catDups}</strong>`;
    }

    const totalEl = document.getElementById('total-stats');
    if (totalEl) {
        totalEl.innerHTML = `Progress Total: <strong>${allOwned}/${allTotal} (${allPercent}%)</strong> &bull; Available duplicates: <strong>${allDups}</strong>`;
    }

    const maxSpread = Math.ceil(PUZZLES_CATALOG.length / ITEMS_PER_SPREAD) - 1;
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    if (prevBtn) prevBtn.disabled = (currentSpread === 0);
    if (nextBtn) nextBtn.disabled = (currentSpread >= maxSpread);
}

// Gestion des flèches du dashboard
const btnPrev = document.getElementById('btn-prev-page');
const btnNext = document.getElementById('btn-next-page');

if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
        if (currentSpread > 0) {
            currentSpread--;
            renderDashboard();
        }
    });

    btnNext.addEventListener('click', () => {
        const maxSpread = Math.ceil(PUZZLES_CATALOG.length / ITEMS_PER_SPREAD) - 1;
        if (currentSpread < maxSpread) {
            currentSpread++;
            renderDashboard();
        }
    });
}

// Lancement initial au chargement de dashboard.html
renderDashboard();

// Variable globale pour suivre le puzzle en cours d'édition dans la modale
let activeModalPuzzleId = null;
// Copie temporaire locale des pièces pendant qu'on les modifie dans la modale
let tempPuzzlePieces = {};

// 1. OUVERTURE DE LA MODALE
function openPuzzleModal(puzzleId) {
    const puzzle = PUZZLES_CATALOG.find(p => p.id === puzzleId);
    if (!puzzle) return;

    activeModalPuzzleId = puzzleId;
    document.getElementById('modal-puzzle-title').textContent = `${puzzle.name} (${puzzle.totalPieces} pieces)`;
    
    // Charger l'inventaire actuel du puzzle (ou vide si rien)
    tempPuzzlePieces = JSON.parse(JSON.stringify(userInventory[puzzleId] || {}));

    // Adapter dynamiquement le nombre de colonnes CSS selon le format (7x4, 6x4 ou 5x3)
    const piecesGridEl = document.getElementById('pieces-grid');
    if (puzzle.totalPieces === 28) {
        piecesGridEl.style.gridTemplateColumns = "repeat(7, 1fr)"; // Format 7x4
    } else if (puzzle.totalPieces === 24) {
        piecesGridEl.style.gridTemplateColumns = "repeat(6, 1fr)"; // Format 6x4
    } else {
        piecesGridEl.style.gridTemplateColumns = "repeat(5, 1fr)"; // Format 5x3 (15 pièces)
    }

    renderPiecesGrid(puzzle.totalPieces);

    // Afficher la modale
    document.getElementById('puzzle-modal').classList.remove('hidden');
}

// 2. RENDU DES CASES DE PIÈCES
function renderPiecesGrid(totalPieces) {
    const gridEl = document.getElementById('pieces-grid');
    gridEl.innerHTML = '';

    for (let i = 1; i <= totalPieces; i++) {
        const qty = tempPuzzlePieces[i] || 0;
        
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece-box';
        if (qty === 1) pieceDiv.classList.add('owned');
        if (qty > 1) pieceDiv.classList.add('duplicate');

        pieceDiv.innerHTML = `
            <div class="piece-num">#${i}</div>
            <div class="piece-qty">${qty > 0 ? 'x' + qty : '—'}</div>
        `;

        // Clic gauche : Incrémente la quantité (+1)
        pieceDiv.addEventListener('click', (e) => {
            e.preventDefault();
            tempPuzzlePieces[i] = (tempPuzzlePieces[i] || 0) + 1;
            renderPiecesGrid(totalPieces);
        });

        // Clic droit : Décrémente la quantité (-1) sans descendre en dessous de 0
        pieceDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (tempPuzzlePieces[i] > 0) {
                tempPuzzlePieces[i]--;
                if (tempPuzzlePieces[i] === 0) delete tempPuzzlePieces[i];
            }
            renderPiecesGrid(totalPieces);
        });

        gridEl.appendChild(pieceDiv);
    }
}

// 3. FERMETURE ET SAUVEGARDE
const modalEl = document.getElementById('puzzle-modal');
const btnCloseModal = document.getElementById('close-modal');
const btnSaveModal = document.getElementById('btn-save-puzzle');

function closeModal() {
    if (modalEl) {
        modalEl.classList.add('hidden');
    }
    activeModalPuzzleId = null;
}

// Fermeture par la croix
if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
}

// Fermeture en cliquant en dehors de la carte
if (modalEl) {
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            closeModal();
        }
    });
}

// Sauvegarde et fermeture
if (btnSaveModal) {
    btnSaveModal.addEventListener('click', () => {
        console.log("Clic sur Save détecté pour :", activeModalPuzzleId); // Pour le débogage (F12)
        
        if (activeModalPuzzleId) {
            if (Object.keys(tempPuzzlePieces).length > 0) {
                userInventory[activeModalPuzzleId] = tempPuzzlePieces;
            } else {
                delete userInventory[activeModalPuzzleId];
            }

            // Sauvegarde dans le stockage local du navigateur
            localStorage.setItem('vr_user_inventory', JSON.stringify(userInventory));
            
            // Rafraîchir l'affichage du grimoire principal
            renderDashboard();
        }
        closeModal();
    });
}