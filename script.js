/**
 * @file script.js
 * @brief Lógica principal del juego "UNAL: Lucha por el Territorio".
 *
 * @details
 * Este archivo contiene la configuración del mapa (nodos y adyacencias),
 * definición de facciones, estado global del juego, la clase Node que
 * maneja la representación de cada nodo, la IA enemiga, la lógica de
 * turnos, combate, mejoras, habilidades, y la actualización de la UI.
 *
 *
 * @author Juan Bohorquez (jbohorquezsa@unal.edu.co)
 * @author Julian Quintero (julquinteroca@unal.edu.co)
 * @author Tomas Suarez (tsuarezl@unal.edu.co)
 */

/* ========================================================================
   CONFIGURACIÓN DEL JUEGO
   ======================================================================== */

/**
 * @brief Datos estáticos de los nodos del mapa.
 *
 * Cada entrada contiene:
 *  - id: identificador único (string)
 *  - name: nombre legible
 *  - x, y: coordenadas en el canvas/área de juego (0..920 aprox.)
 *  - startNode (opcional): indica nodos de inicio para asignación random
 */
const NODE_DATA = [
    { id: 'artes', name: "Facultad de Artes", x: 712, y: 546 },
    { id: 'ciencias', name: "Facultad de Ciencias", x: 455, y: 522 },
    { id: 'agrarias', name: "Facultad de Cs. Agrarias", x: 350, y: 605 },
    { id: 'economicas', name: "Facultad de Cs. Económicas", x: 750, y: 515 },
    { id: 'politicas', name: "Facultad de Cs. Políticas", x: 808, y: 665 },
    { id: 'derecho', name: "Facultad de Derecho", x: 560, y: 638 },
    { id: 'enfermeria', name: "Facultad de Enfermería", x: 495, y: 635 },
    { id: 'ingenieria', name: "Facultad de Ingeniería", x: 495, y: 465 },
    { id: 'medicina', name: "Facultad de Medicina", x: 535, y: 585 },
    { id: 'veterinaria', name: "Facultad de Veterinaria (Zootecnia)", x: 445, y: 605 },
    { id: 'odontologia', name: "Facultad de Odontología", x: 485, y: 710 },
    { id: 'plaza_che', name: "Plaza Che", x: 615, y: 585 },
    { id: 'carpa_cultural', name: "Carpa Cultural", x: 675, y: 475 },
    { id: 'estadio', name: "El Estadio", x: 390, y: 320, startNode: true },
    { id: 'posgrados', name: "Posgrados", x: 382, y: 725 },
    { id: 'la_26', name: "La 26", x: 270, y: 725, startNode: true },
    { id: 'la_30', name: "La 30", x: 675, y: 795, startNode: true },
];

/**
 * @brief Lista de adyacencias dirigida (se usará enforceBidirectional
 *        para convertirla a no dirigida).
 *
 * @note Mantener consistencia de ids con NODE_DATA.
 */
const ADJACENCY_LIST = {
    'la_26': ['enfermeria', 'derecho'],
    'la_30': ['economicas', 'politicas'],
    'estadio': ['ingenieria', 'ciencias'],
    'posgrados': ['enfermeria', 'veterinaria', 'odontologia'],
    'carpa_cultural': ['plaza_che'],
    'plaza_che': ['artes', 'ciencias', 'economicas', 'derecho', 'medicina', 'carpa_cultural'],
    'odontologia': ['agrarias', 'enfermeria', 'veterinaria', 'posgrados'],
    'veterinaria': ['agrarias', 'enfermeria', 'odontologia', 'posgrados'],
    'medicina': ['ciencias', 'agrarias', 'derecho', 'enfermeria', 'ingenieria', 'plaza_che'],
    'ingenieria': ['ciencias', 'agrarias', 'estadio', 'economicas'],
    'enfermeria': ['agrarias', 'derecho', 'medicina', 'veterinaria', 'odontologia', 'posgrados', 'la_26'],
    'derecho': ['enfermeria', 'medicina', 'plaza_che', 'la_26'],
    'politicas': ['artes', 'economicas', 'la_30'],
    'economicas': ['artes', 'politicas', 'ingenieria', 'plaza_che', 'la_30'],
    'agrarias': ['enfermeria', 'ingenieria', 'medicina', 'veterinaria', 'odontologia',],
    'ciencias': ['artes', 'ingenieria', 'medicina', 'plaza_che', 'estadio'],
    'artes': ['ciencias', 'economicas', 'politicas', 'plaza_che'],
};

/**
 * @brief Asegura que la lista de adyacencias sea bidireccional.
 * @param {Object} adjList - Mapa de adyacencia inicial (posiblemente no bidireccional).
 * @return {Object} nuevo mapa bidireccional.
 */
function enforceBidirectional(adjList) {
    const newAdj = {...adjList};
    for (const nodeA in adjList) {
        adjList[nodeA].forEach(nodeB => {
            if (!newAdj[nodeB]) newAdj[nodeB] = [];
            if (!newAdj[nodeB].includes(nodeA)) {
                newAdj[nodeB].push(nodeA);
            }
        });
    }
    return newAdj;
}
const GAME_ADJACENCY_LIST = enforceBidirectional(ADJACENCY_LIST);

/**
 * @brief Definición de facciones (datos estáticos).
 *
 * Cada facción contiene:
 *  - color: variable CSS para UI
 *  - icon: ruta al icono
 *  - name: nombre legible
 *  - baseStats: life, attack, space (por tropa / capacidad)
 *  - skill: objeto con nombre, cooldown, efecto, icon, trigger, description
 */
const FACTIONS = {
    'ESMAD': {
        color: 'var(--color-esmad)',
        icon: 'assets/esmad_tanqueta.png',
        name: 'ESMAD',
        baseStats: { life: 20, attack: 10, space: 16 },
        skill: {
            name: 'Ataque con Tanqueta',
            cooldown: 2,
            effect: 'Aumenta el ataque en un 50% por este turno.',
            icon: 'assets/esmad_skill.png',
            trigger: 'defend',
            description: "Otorga un aumento significativo al ataque del nodo seleccionado para el siguiente combate."
        },
    },
    'Capuchos': {
        color: 'var(--color-capuchos)',
        icon: 'assets/capuchos_chaza.png',
        name: 'Capuchos',
        baseStats: { life: 12, attack: 14, space: 20 },
        skill: {
            name: 'Escudo de Primera Línea',
            cooldown: 3,
            effect: 'Reduce el daño del siguiente ataque recibido en un 50% (en el nodo objetivo).',
            icon: 'assets/capuchos_skill.png',
            trigger: 'attack',
            description: "Activa un escudo defensivo en el nodo seleccionado, negando el daño del primer ataque enemigo."
        },
    },
    'Minga': {
        color: 'var(--color-minga)',
        icon: 'assets/minga_carpa.png',
        name: 'Minga',
        baseStats: { life: 10, attack: 10, space: 26 },
        skill: {
            name: 'Duplicar Tropas',
            cooldown: 4,
            effect: 'Duplica las tropas de un nodo (hasta el límite de espacio).',
            icon: 'assets/minga_skill.png',
            trigger: 'produce',
            description: "Duplica las tropas en el nodo seleccionado, limitado por el espacio máximo del nodo."
        },
    }
};

/** @brief Dinero inicial del jugador. */
const INITIAL_MONEY = 0;
/** @brief Costo base para mejorar nivel de tropas (escala por nivel). */
const TROOP_UPGRADE_COST = 20;
/** @brief Costos para mejorar acciones: N1->N2, N2->N3 */
const ACTION_UPGRADE_COSTS = [15, 30];

/* ========================================================================
   ESTADO GLOBAL DEL JUEGO
   ======================================================================== */

/**
 * @brief Estado global que mantiene la sesión del juego.
 * @property {number} turn - número de turno actual
 * @property {string|null} playerFaction - facción elegida por el jugador
 * @property {string|null} aiFaction - facción de la IA
 * @property {number} money - dinero del jugador
 * @property {Object} nodes - mapa id -> Node (instancias)
 * @property {string} currentPlayer - 'Player' | 'AI'
 * @property {string|null} selectedNode - id del nodo seleccionado por jugador
 * @property {number} actionsLeft - acciones restantes del jugador este turno
 * @property {number} troopLevel - nivel global de tropas (mejora)
 * @property {Object} actionLevels - niveles de acción {attack, defend, produce}
 * @property {number} skillCooldown - cooldown global de la habilidad (compartido)
 */
let gameState = {
    turn: 0,
    playerFaction: null,
    aiFaction: null,
    money: INITIAL_MONEY,
    nodes: {},
    currentPlayer: 'Player',
    selectedNode: null,
    actionsLeft: 1,
    troopLevel: 1,
    actionLevels: { attack: 1, defend: 1, produce: 1 },
    skillCooldown: 0,
};

/* ========================================================================
   CLASES Y FUNCIONES BASE
   ======================================================================== */

/**
 * @class Node
 * @brief Representa un nodo del mapa con estado y representación visual.
 *
 * @details
 * Cada instancia crea su elemento DOM dentro de #game-area y expone:
 *  - id, name, x, y
 *  - owner: 'Neutral' | nombre de facción
 *  - troops: número de tropas
 *  - defenseTurns: turnos restantes de defensa
 *  - shieldActive: boolean (escudo activo)
 *
 * @param {Object} data - objeto con keys {id, name, x, y, startNode?}
 */
class Node {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;
        this.owner = 'Neutral';
        this.troops = 0;
        this.defenseTurns = 0;
        this.shieldActive = false;
        // Crear visual en DOM
        this.element = this.createVisualElement();
    }

    /**
     * @brief Crea el elemento DOM del nodo y asigna listeners.
     * @return {HTMLElement} referencia al div creado.
     */
    createVisualElement() {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node Neutral';
        nodeDiv.id = this.id;
        nodeDiv.style.left = `${this.x - 24}px`;
        nodeDiv.style.top = `${this.y - 24}px`;
        nodeDiv.innerHTML = `<span class="node-troop-count">0</span>`;

        // Tooltip: mouseover, mousemove, mouseout
        nodeDiv.addEventListener('mouseover', (e) => {
            const nodeData = gameState.nodes[this.id];
            if (nodeData) {
                showTooltip(nodeDiv, nodeData);
            }
        });
        nodeDiv.addEventListener('mousemove', (e) => {
            positionTooltip(e);
        });
        nodeDiv.addEventListener('mouseout', hideTooltip);

        // Click para seleccionar / interactuar
        nodeDiv.addEventListener('click', () => handleNodeClick(this.id));

        // Append al contenedor del mapa
        document.getElementById('game-area').appendChild(nodeDiv);
        return nodeDiv;
    }

    /**
     * @brief Calcula estadísticas derivadas del nodo (vida total, ataque total, espacio).
     * @return {Object} { totalLife, totalAttack, space }
     */
    getStats() {
        if (this.owner === 'Neutral' || this.troops === 0) {
            return { totalLife: 0, totalAttack: 0, space: 0 };
        }

        const faction = FACTIONS[this.owner];
        const base = faction.baseStats;
        const levelBonus = (gameState.troopLevel - 1) * 0.05;

        const lifePerTroop = base.life * (1 + levelBonus);
        const attackPerTroop = base.attack * (1 + levelBonus);
        const maxSpace = base.space * (1 + levelBonus);

        let totalLife = Math.round(this.troops * lifePerTroop);
        let totalAttack = Math.round(this.troops * attackPerTroop);

        const defenseLevel = gameState.actionLevels.defend;
        let defenseBonus = 0;
        if (this.defenseTurns > 0) {
            defenseBonus = 0.10 * defenseLevel;
        }
        totalLife = Math.round(totalLife * (1 + defenseBonus));

        return {
            totalLife: totalLife,
            totalAttack: totalAttack,
            space: Math.round(maxSpace)
        };
    }

    /**
     * @brief Actualiza la representación visual del nodo (tropas, icono, clase).
     * @note No devuelve valor; actualiza DOM interno.
     */
    updateVisuals() {
        this.element.querySelector('.node-troop-count').textContent = this.troops;
        this.element.className = `node ${this.owner}`;

        let iconEl = this.element.querySelector('.node-icon');
        if (this.owner !== 'Neutral' && this.troops > 0) {
            if (!iconEl) {
                iconEl = document.createElement('img');
                iconEl.className = 'node-icon';
                this.element.appendChild(iconEl);
            }
            iconEl.src = `assets/faccion_${this.owner.toLowerCase()}.png`;
            iconEl.style.display = 'block';
        } else {
            if (iconEl) iconEl.style.display = 'none';
        }
    }
}

/* ========================================================================
   GEOMETRÍA Y VISUALES
   ======================================================================== */

/**
 * @brief Dibuja las conexiones (líneas) entre nodos adyacentes en canvas.
 *
 * @note Las líneas se dibujan en #connection-canvas y se limpian al inicio.
 */
function drawConnections() {
    const canvas = document.getElementById('connection-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const drawnConnections = new Set();

    for (const nodeId in GAME_ADJACENCY_LIST) {
        const nodeA = gameState.nodes[nodeId];
        if (!nodeA) continue;

        GAME_ADJACENCY_LIST[nodeId].forEach(neighborId => {
            const nodeB = gameState.nodes[neighborId];
            if (!nodeB) return;

            const connectionKey = [nodeA.id, nodeB.id].sort().join('-');

            if (!drawnConnections.has(connectionKey)) {
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                drawnConnections.add(connectionKey);
            }
        });
    }
}

/**
 * @brief Ejecuta una animación visual simple para la activación de la habilidad.
 * @param {Node} node - nodo objetivo de la animación.
 * @param {string} faction - nombre de la facción (para clase CSS).
 */
function triggerSkillAnimation(node, faction) {
    const animEl = document.createElement('div');
    animEl.className = `skill-animation ${faction.toLowerCase()}-skill-anim`;
    animEl.style.left = `${node.x - 32}px`;
    animEl.style.top = `${node.y - 32}px`;

    document.getElementById('game-area').appendChild(animEl);

    setTimeout(() => {
        animEl.remove();
    }, 800);
}

/* ========================================================================
   INICIALIZACIÓN DEL JUEGO
   ======================================================================== */

/**
 * @brief Maneja la selección de facción desde la pantalla inicial.
 * @param {Event} e - evento click del botón de facción.
 */
function selectFaction(e) {
    const clickedButton = e.target.closest('.faction-btn');
    if (!clickedButton) return;

    const faction = clickedButton.dataset.faction;
    if (faction) {
        gameState.playerFaction = faction;
        document.getElementById('start-screen').classList.add('hidden');
        setupGameWorld();
    }
}

/**
 * @brief Inicializa el mundo del juego: crea nodos, asigna nodos iniciales, dibuja conexiones y comienza el turno.
 */
function setupGameWorld() {
    const playerFaction = gameState.playerFaction;

    const availableFactions = Object.keys(FACTIONS).filter(f => f !== playerFaction);
    const aiFactionIndex = Math.floor(Math.random() * availableFactions.length);
    gameState.aiFaction = availableFactions[aiFactionIndex];

    const startNodes = NODE_DATA.filter(n => n.startNode);
    if (startNodes.length < 2) {
        console.error("No hay suficientes nodos iniciales marcados.");
        return;
    }
    const shuffledStartNodes = startNodes.sort(() => 0.5 - Math.random());

    const playerStartNode = shuffledStartNodes.pop().id;
    const aiStartNode = shuffledStartNodes.pop().id;

    NODE_DATA.forEach(data => {
        const node = new Node(data);
        gameState.nodes[data.id] = node;

        if (data.id === playerStartNode) {
            node.owner = playerFaction;
            node.troops = 1;
        } else if (data.id === aiStartNode) {
            node.owner = gameState.aiFaction;
            node.troops = 1;
        }
        node.updateVisuals();
    });

    drawConnections();
    updateUI();
    startTurn();
}

/**
 * @brief Inicia el flujo del juego después de cargar el DOM.
 * @note Muestra pantalla de selección si no hay facción elegida.
 */
function initGame() {
    if (!gameState.playerFaction) {
        document.getElementById('start-screen').classList.remove('hidden');
    } else {
        setupGameWorld();
    }
}

/* ========================================================================
   MANEJO DE TURNOS
   ======================================================================== */

/**
 * @brief Comienza un nuevo turno para el jugador.
 * @details Incrementa el contador de turnos, gestiona cooldowns, genera recursos y prepara acciones.
 */
function startTurn() {
    gameState.turn++;
    gameState.currentPlayer = 'Player';
    gameState.actionsLeft = calculateMaxActions(gameState.playerFaction);
    gameState.selectedNode = null;

    Object.values(gameState.nodes).forEach(node => {
        if (node.defenseTurns > 0) {
            node.defenseTurns--;
        }
    });

    if (gameState.skillCooldown > 0) {
        gameState.skillCooldown--;
    }

    generateResources();

    updateUI();
    document.getElementById('turn-text').textContent = "Tu Turno";
    document.getElementById('turn-counter').textContent = `T: ${gameState.turn}`;
    document.getElementById('end-turn-btn').disabled = false;
}

/**
 * @brief Calcula producción pasiva de tropas y dinero por turno.
 * @note La IA no gana dinero, solo tropas.
 */
function generateResources() {
    let playerMoneyGained = 0;

    const produceLevel = gameState.actionLevels.produce;
    let productionBonus = 0;
    if (produceLevel === 2) productionBonus = 1;
    if (produceLevel === 3) productionBonus = 2;
    const passiveProduction = 1 + productionBonus;

    Object.values(gameState.nodes).forEach(node => {
        if (node.owner === gameState.playerFaction) {
            playerMoneyGained++;

            const stats = node.getStats();
            if (node.troops < stats.space) {
                node.troops = Math.min(node.troops + passiveProduction, stats.space);
                node.updateVisuals();
            }
        } else if (node.owner === gameState.aiFaction) {
            const stats = node.getStats();
            if (node.troops < stats.space) {
                node.troops = Math.min(node.troops + passiveProduction, stats.space);
                node.updateVisuals();
            }
        }
    });

    gameState.money += playerMoneyGained;
}

/**
 * @brief Calcula el número máximo de acciones del jugador en función de nodos controlados.
 * @param {string} faction - facción a evaluar.
 * @return {number} máximo de acciones (1..4)
 */
function calculateMaxActions(faction) {
    const controlledNodes = Object.values(gameState.nodes).filter(n => n.owner === faction).length;
    return Math.min(controlledNodes, 4);
}

/* ========================================================================
   EVENTS: FIN DE TURNO (BOTÓN)
   ======================================================================== */

document.getElementById('end-turn-btn').addEventListener('click', () => {
    document.getElementById('end-turn-btn').disabled = true;
    gameState.currentPlayer = 'AI';
    updateUI();
    document.getElementById('turn-text').textContent = "Turno de la IA...";
    setTimeout(aiTurn, 1000);
});

/* ========================================================================
   MANEJO DE TURNOS (IA)
   ======================================================================== */

/**
 * @brief Ejecuta el turno completo de la IA: calcula acciones y las ejecuta con delays.
 * @details Obtiene acciones de la clase AI, ejecuta cada acción con retardo
 *          y finaliza el turno volviendo el control al jugador.
 */
function aiTurn() {
    const ai = new AI(gameState.aiFaction);

    const actions = ai.getActions();

    const actionDelayTime = 500;
    let totalDelay = 0;

    actions.forEach((action) => {
        setTimeout(() => {
            ai.executeAction(action);
            updateUI();
        }, totalDelay);
        totalDelay += actionDelayTime;
    });

    setTimeout(() => {
        if (!checkGameOver()) {
            gameState.currentPlayer = 'Player';
            startTurn();
        }
    }, totalDelay + 500);
}

/* ========================================================================
   CLASE: INTELIGENCIA ARTIFICIAL (AI)
   ======================================================================== */

/**
 * @class AI
 * @brief Lógica simple/heurística para la facción controlada por la IA.
 *
 * @param {string} faction - nombre de la facción de la IA.
 */
class AI {
    constructor(faction) {
        this.faction = faction;
        this.actionsLeft = calculateMaxActions(faction);
    }

    /**
     * @brief Construye una cola de acciones basada en heurísticas.
     * @return {Array<Object>} lista de acciones (type, source, target?, amount?)
     *
     * @note Acciones principales consumen accionesLeft; transferencias no.
     */
    getActions() {
        const actionQueue = [];
        const myNodes = Object.values(gameState.nodes).filter(n => n.owner === this.faction);
        const usedNodes = new Set();

        for (const myNode of myNodes) {
            if (this.actionsLeft <= 0) break;
            if (usedNodes.has(myNode.id)) continue;

            const myStats = myNode.getStats();
            const adjacents = GAME_ADJACENCY_LIST[myNode.id].map(id => gameState.nodes[id]);
            let actionSelected = false;

            // P1: ATAQUE
            if (myNode.troops > 1) {
                const target = adjacents.filter(n => n.owner !== this.faction)
                                        .sort((a, b) => a.getStats().totalLife - b.getStats().totalLife)
                                        .find(n => myStats.totalAttack > n.getStats().totalLife);

                if (target) {
                    actionQueue.push({ type: 'attack', source: myNode.id, target: target.id });
                    actionSelected = true;
                }
            }

            if (actionSelected) {
                 this.actionsLeft--;
                 usedNodes.add(myNode.id);
                 continue;
            }

            // P2: DEFENSA
            if (myNode.defenseTurns === 0) {
                 const threat = adjacents.find(n =>
                    n.owner !== this.faction && n.owner !== 'Neutral' && n.getStats().totalAttack > myStats.totalLife
                 );
                 if (threat) {
                    actionQueue.push({ type: 'defend', source: myNode.id });
                    actionSelected = true;
                 }
            }

            if (actionSelected) {
                 this.actionsLeft--;
                 usedNodes.add(myNode.id);
                 continue;
            }

            // P3: PRODUCCIÓN
            if (myNode.troops < myStats.space) {
                 actionQueue.push({ type: 'produce', source: myNode.id });
                 this.actionsLeft--;
                 usedNodes.add(myNode.id);
            }

            // P4: TRANSFERENCIA (no consume acción)
            const internalNodes = Object.values(gameState.nodes).filter(n =>
                n.owner === this.faction && n.troops > 1 &&
                GAME_ADJACENCY_LIST[n.id].every(adjId => gameState.nodes[adjId].owner === this.faction)
            );

            if (internalNodes.length > 0) {
                const source = internalNodes[0];
                const adjacentFriendly = GAME_ADJACENCY_LIST[source.id]
                                          .map(id => gameState.nodes[id])
                                          .filter(n => n.owner === this.faction)
                                          .sort((a, b) => a.troops - b.troops);

                if (adjacentFriendly.length > 0) {
                     const transferAmount = Math.floor((source.troops - 1) / 3);
                     if (transferAmount > 0) {
                        actionQueue.push({
                            type: 'transfer',
                            source: source.id,
                            target: adjacentFriendly[0].id,
                            amount: transferAmount
                        });
                        continue;
                     }
                }
            }
        }
        return actionQueue;
    }

    /**
     * @brief Ejecuta una acción proveniente de la cola calculada.
     * @param {Object} action - acción con tipo y parámetros.
     */
    executeAction(action) {
        const sourceNode = gameState.nodes[action.source];
        const skillReady = gameState.skillCooldown === 0;

        if (skillReady) {
            const skill = FACTIONS[this.faction].skill;

            if (this.faction === 'ESMAD' && action.type === 'defend') {
                sourceNode.defenseTurns = gameState.actionLevels.defend + 1;
                sourceNode.shieldActive = true;
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            } else if (this.faction === 'Capuchos' && action.type === 'attack') {
                sourceNode.shieldActive = true;
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            } else if (this.faction === 'Minga' && action.type === 'produce') {
                const stats = sourceNode.getStats();
                const newTroops = Math.min(sourceNode.troops * 2, stats.space);
                sourceNode.troops = newTroops;
                sourceNode.updateVisuals();
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            }
        }

        if (action.type === 'attack') {
            const targetNode = gameState.nodes[action.target];
            if (sourceNode.troops > 1) {
                executeAttack(sourceNode, targetNode);
            }
        } else if (action.type === 'defend') {
            if (sourceNode.owner === this.faction && sourceNode.defenseTurns === 0) {
                sourceNode.defenseTurns = gameState.actionLevels.defend;
            }
        } else if (action.type === 'produce') {
            const stats = sourceNode.getStats();
            const producedBySkill = (this.faction === 'Minga' && skillReady && action.type === 'produce');

            if (!producedBySkill && sourceNode.owner === this.faction) {
                const produceLevel = gameState.actionLevels.produce;
                let production = produceLevel;
                sourceNode.troops = Math.min(sourceNode.troops + production, stats.space);
                sourceNode.updateVisuals();
            }
        } else if (action.type === 'transfer') {
            const targetNode = gameState.nodes[action.target];
            executeTransfer(sourceNode, targetNode, action.amount);
        }
    }

    /**
     * @brief Intento de la IA por gastar dinero en mejoras si le alcanza.
     * @note Lógica simple: prioriza tropas, luego producción, ataque, defensa.
     */
    upgradeIfPossible() {
        let troopCost = TROOP_UPGRADE_COST * gameState.troopLevel;
        if (gameState.money >= troopCost && gameState.troopLevel < 10) {
            handleUpgrade('troop');
            return;
        }

        if (gameState.actionLevels.produce < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.produce - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'produce');
                return;
            }
        }

        if (gameState.actionLevels.attack < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.attack - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'attack');
                return;
            }
        }

        if (gameState.actionLevels.defend < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.defend - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'defend');
                return;
            }
        }
    }
}

/* ========================================================================
   INICIO DEL JUEGO (DOM READY)
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faction-btn').forEach(btn => {
        btn.addEventListener('click', selectFaction);
    });

    initGame();
});

/* ========================================================================
   INTERACCIÓN DEL JUGADOR
   ======================================================================== */

/**
 * @brief Maneja clics en nodos (selección, transferencia, ataque).
 * @param {string} nodeId - id del nodo clickeado.
 */
function handleNodeClick(nodeId) {
    const targetNode = gameState.nodes[nodeId];

    if (gameState.currentPlayer !== 'Player') return;

    if (gameState.selectedNode === null) {
        if (targetNode.owner === gameState.playerFaction) {
            gameState.selectedNode = nodeId;
            document.querySelectorAll('.node').forEach(el => el.classList.remove('selected'));
            targetNode.element.classList.add('selected');
        }
        return;
    }

    const sourceNode = gameState.nodes[gameState.selectedNode];

    if (sourceNode === targetNode) {
        sourceNode.element.classList.remove('selected');
        gameState.selectedNode = null;
        updateUI();
        return;
    }

    const isAdjacent = GAME_ADJACENCY_LIST[sourceNode.id].includes(targetNode.id);

    if (!isAdjacent) {
        sourceNode.element.classList.remove('selected');
        gameState.selectedNode = null;

        if (targetNode.owner === gameState.playerFaction) {
             gameState.selectedNode = nodeId;
             targetNode.element.classList.add('selected');
        }
        updateUI();
        return;
    }

    if (targetNode.owner === gameState.playerFaction) {
        const maxTransfer = sourceNode.troops - 1;
        let transferCompleted = false;

        if (maxTransfer <= 0) {
            displayMessage("No hay tropas suficientes para transferir. Necesitas al menos 2.", 'error');
        } else {
            try {
                let transferAmount = prompt(`¿Cuántas tropas deseas mover de ${sourceNode.name} a ${targetNode.name}? (Máximo: ${maxTransfer})`);
                transferAmount = parseInt(transferAmount);

                if (!isNaN(transferAmount) && transferAmount > 0 && transferAmount <= maxTransfer) {
                    executeTransfer(sourceNode, targetNode, transferAmount);
                    transferCompleted = true;
                } else if (transferAmount !== null) {
                    displayMessage("Transferencia cancelada o cantidad inválida.", 'warning');
                }
            } catch (e) {
                console.error("Error durante el prompt de transferencia:", e);
                displayMessage("Error al procesar la transferencia.", 'error');
            }
        }

        sourceNode.element.classList.remove('selected');
        gameState.selectedNode = null;
        updateUI();
        return;
    }

    else if (targetNode.owner !== gameState.playerFaction) {
        if (gameState.actionsLeft > 0) {
            executeAttack(sourceNode, targetNode);

            if (checkGameOver()) {
                return;
            }

            gameState.actionsLeft--;
            updateUI();

            displayMessage(`Ataque lanzado desde ${sourceNode.name} a ${targetNode.name}.`, 'info');

        } else {
            displayMessage("No te quedan acciones para atacar.", 'warning');
        }
    }

    sourceNode.element.classList.remove('selected');
    gameState.selectedNode = null;
    updateUI();
}

/* ========================================================================
   MOTOR DE COMBATE
   ======================================================================== */

/**
 * @brief Ejecuta la lógica del combate entre dos nodos.
 *
 * @param {Node} attackerNode - nodo atacante.
 * @param {Node} defenderNode - nodo defensor.
 *
 * @details
 *  - Calcula daño total de ambos bandos
 *  - Calcula bajas (redondeando hacia arriba)
 *  - Aplica consumos de defensa y escudos
 *  - Si defensor queda en 0, se intenta la conquista con tropas sobrevivientes
 *  - Nodos en 0 tropas pasan a Neutral
 */
function executeAttack(attackerNode, defenderNode) {
    if (attackerNode.owner === defenderNode.owner || attackerNode.troops <= 1) return;

    const attackerStats = attackerNode.getStats();
    const defenderStats = defenderNode.getStats();

    const initialAttackerTroops = attackerNode.troops;

    const attackerDamage = attackerStats.totalAttack;
    const defenderDamage = defenderStats.totalAttack;

    const defenderLifePerTroop = defenderNode.troops > 0
                               ? defenderStats.totalLife / defenderNode.troops
                               : 1;
    let defenderLostTroops = defenderNode.troops > 0
                             ? Math.ceil(attackerDamage / defenderLifePerTroop)
                             : 0;

    const attackerLifePerTroop = attackerNode.troops > 0
                               ? attackerStats.totalLife / attackerNode.troops
                               : 1;

    let attackerLostTroops = attackerNode.troops > 0 && defenderNode.troops > 0
                             ? Math.ceil(defenderDamage / attackerLifePerTroop)
                             : 0;

    attackerNode.troops = Math.max(0, attackerNode.troops - attackerLostTroops);

    let remainingDefenderTroops = defenderNode.troops - defenderLostTroops;

    if (defenderNode.defenseTurns > 0) {
        defenderNode.defenseTurns--;
    }
    if (defenderNode.shieldActive) {
        defenderNode.shieldActive = false;
    }

    if (remainingDefenderTroops <= 0) {
        const troopsSurvived = initialAttackerTroops - attackerLostTroops;

        if (troopsSurvived > 0) {
            const troopsToMove = Math.max(0, troopsSurvived - 1);
            const troopsRemainingInAttacker = troopsSurvived - troopsToMove;

            defenderNode.owner = attackerNode.owner;
            defenderNode.troops = Math.max(1, troopsToMove);
            attackerNode.troops = troopsRemainingInAttacker;

            defenderNode.defenseTurns = 0;
            defenderNode.shieldActive = false;
        } else {
             defenderNode.troops = 0;
        }
    } else {
        defenderNode.troops = Math.max(1, remainingDefenderTroops);
    }

    if (attackerNode.troops === 0) {
        attackerNode.owner = 'Neutral';
    }

    if (defenderNode.troops === 0 && defenderNode.owner !== attackerNode.owner) {
        defenderNode.owner = 'Neutral';
    }

    if (attackerNode.owner === 'Neutral') {
        attackerNode.defenseTurns = 0;
        attackerNode.shieldActive = false;
    }
    if (defenderNode.owner === 'Neutral') {
        defenderNode.defenseTurns = 0;
        defenderNode.shieldActive = false;
    }

    attackerNode.updateVisuals();
    defenderNode.updateVisuals();
}

/**
 * @brief Comprueba condición de victoria global y muestra pantalla final si procede.
 * @param {string} [lastConqueror] - facción que realizó la última conquista (opcional).
 */
function checkWinCondition(lastConqueror) {
    const remainingFactions = new Set(Object.values(gameState.nodes).map(n => n.owner).filter(o => o !== 'Neutral'));

    if (remainingFactions.size <= 1) {
        let winner = lastConqueror;
        if (remainingFactions.size === 1) {
            winner = remainingFactions.values().next().value;
        }

        const message = winner === gameState.playerFaction ? "¡Victoria! Has conquistado todo el territorio." : "Derrota. La IA ha ganado.";
        showEndGame(message);
    }
}

/**
 * @brief Muestra la pantalla de fin de juego con mensaje.
 * @param {string} message - texto a mostrar en la pantalla final.
 */
function showEndGame(message) {
    document.getElementById('end-game-message').textContent = message;
    document.getElementById('end-game-screen').classList.remove('hidden');
}

/* ========================================================================
   MEJORAS Y HABILIDADES
   ======================================================================== */

/**
 * @brief Aplica mejoras (tropas o acción) si el jugador tiene dinero.
 * @param {string} type - 'troop' o 'action'
 * @param {string|null} actionName - 'attack'|'defend'|'produce' si type==='action'
 */
function handleUpgrade(type, actionName = null) {
    let currentLevel, cost;

    if (type === 'troop') {
        currentLevel = gameState.troopLevel;
        if (currentLevel >= 10) return;
        cost = TROOP_UPGRADE_COST * currentLevel;
    } else if (type === 'action') {
        currentLevel = gameState.actionLevels[actionName];
        if (currentLevel >= 3) return;
        cost = ACTION_UPGRADE_COSTS[currentLevel - 1];
    }

    if (gameState.money >= cost) {
        gameState.money -= cost;

        if (type === 'troop') {
            gameState.troopLevel++;
        } else {
            gameState.actionLevels[actionName]++;
        }

        updateUI();
    } else {
        alert(`No tienes suficiente dinero. Necesitas ${cost}.`);
    }
}

/* Listeners para botones de upgrade */
document.getElementById('upgrade-troop-btn').addEventListener('click', () => handleUpgrade('troop'));
document.querySelectorAll('.upgrade-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => handleUpgrade('action', e.target.dataset.action));
});

/* Acciones de jugador (defensa/producción) */
document.getElementById('action-defend-btn').addEventListener('click', () => {
    if (gameState.actionsLeft <= 0 || !gameState.selectedNode) return;
    const node = gameState.nodes[gameState.selectedNode];

    if (node.owner !== gameState.playerFaction || node.defenseTurns > 0) return;

    node.defenseTurns = gameState.actionLevels.defend;
    gameState.actionsLeft--;

    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    updateUI();
});

document.getElementById('action-produce-btn').addEventListener('click', () => {
    if (gameState.actionsLeft <= 0 || !gameState.selectedNode) return;
    const node = gameState.nodes[gameState.selectedNode];

    if (node.owner !== gameState.playerFaction) return;

    const produceLevel = gameState.actionLevels.produce;
    let production = 1;
    if (produceLevel === 2) production = 2;
    if (produceLevel === 3) production = 3;

    const stats = node.getStats();
    node.troops = Math.min(node.troops + production, stats.space);
    node.updateVisuals();

    gameState.actionsLeft--;

    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    updateUI();
});

/**
 * @brief Uso de la habilidad de la facción del jugador en el nodo seleccionado.
 * @note Valida selección y cooldown; modifica estado del nodo según facción.
 */
function handleSkillUse() {
    if (gameState.currentPlayer !== 'Player' || gameState.skillCooldown > 0) return;

    const faction = gameState.playerFaction;
    const skill = FACTIONS[faction].skill;

    if (!gameState.selectedNode) {
        alert("Selecciona un nodo propio para usar la habilidad.");
        return;
    }
    const node = gameState.nodes[gameState.selectedNode];
    if (node.owner !== faction) {
        alert("La habilidad solo puede usarse en un nodo de tu facción.");
        return;
    }

    switch (faction) {
        case 'ESMAD':
            alert("Habilidad ESMAD (Tanqueta) activada. Tu siguiente ataque será más fuerte.");
            node.attackBoost = true;
            break;
        case 'Capuchos':
            node.shieldActive = true;
            break;
        case 'Minga':
            const stats = node.getStats();
            const newTroops = Math.min(node.troops * 2, stats.space);
            node.troops = newTroops;
            node.updateVisuals();
            break;
    }

    gameState.skillCooldown = FACTIONS[gameState.playerFaction].skill.cooldown;

    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    updateUI();
}

/* ========================================================================
   ACTUALIZACIÓN DE UI Y TOOLTIP
   ======================================================================== */

/**
 * @brief Actualiza indicadores de UI: dinero, acciones, niveles y habilidad.
 */
function updateUI() {
    const faction = gameState.playerFaction;
    const factionData = FACTIONS[faction];
    const skill = factionData.skill;
    const skillCardEl = document.getElementById('skill-card');

    document.getElementById('faction-icon').src = `assets/faccion_${faction.toLowerCase()}.png`;
    document.getElementById('player-faction-name').textContent = factionData.name;
    document.getElementById('current-money').textContent = gameState.money;
    document.getElementById('actions-left-display').textContent = gameState.actionsLeft;

    document.getElementById('troop-level-display').textContent = `Nivel ${gameState.troopLevel}`;
    const baseStats = FACTIONS[faction].baseStats;
    const levelBonus = (gameState.troopLevel - 1) * 0.05;
    document.getElementById('stat-vida').textContent = Math.round(baseStats.life * (1 + levelBonus));
    document.getElementById('stat-ataque').textContent = Math.round(baseStats.attack * (1 + levelBonus));
    document.getElementById('stat-espacio').textContent = Math.round(baseStats.space * (1 + levelBonus));

    const troopCost = TROOP_UPGRADE_COST * gameState.troopLevel;
    document.getElementById('troop-upgrade-cost').textContent = gameState.troopLevel < 10 ? `Costo: ${troopCost}` : 'Máx Nivel';
    document.getElementById('upgrade-troop-btn').disabled = gameState.troopLevel >= 10 || gameState.money < troopCost;

    ['attack', 'defend', 'produce'].forEach((action, index) => {
        const level = gameState.actionLevels[action];
        document.getElementById(`level-${action}`).textContent = `N${level}`;

        const upgradeBtn = document.querySelector(`.upgrade-action-btn[data-action="${action}"]`);
        const costEl = document.getElementById(`${action}-upgrade-cost`);

        if (level < 3) {
            const cost = ACTION_UPGRADE_COSTS[level - 1];
            costEl.textContent = `Costo: ${cost}`;
            upgradeBtn.disabled = gameState.money < cost;
        } else {
            costEl.textContent = 'Máx Nivel';
            upgradeBtn.disabled = true;
        }
    });

    skillCardEl.style.borderColor = factionData.color;
    skillCardEl.innerHTML = `
        <img id="skill-icon-img" class="skill-card-icon" src="${skill.icon}" alt="Habilidad">
        <div class="skill-cooldown-text">C: ${gameState.skillCooldown}</div>
    `;
    skillCardEl.className = `skill-card ${gameState.skillCooldown === 0 ? 'available' : ''}`;

    if (!skillCardEl.dataset.listener) {
        skillCardEl.addEventListener('click', handleSkillUse);
        skillCardEl.dataset.listener = 'true';
    }

    const tooltipElement = document.getElementById('skill-tooltip');

    if (tooltipElement && !skillCardEl.dataset.hoverListener) {
        skillCardEl.addEventListener('mouseover', function(e) {
            const skill = FACTIONS[gameState.playerFaction]?.skill;
            if (skill) {
                tooltipElement.innerHTML = `
                    <h4>${skill.name} (${skill.cooldown} turnos)</h4>
                    <p>${skill.description}</p>
                `;
                tooltipElement.style.left = (e.pageX + 15) + 'px';
                tooltipElement.style.top = (e.pageY + 15) + 'px';
                tooltipElement.classList.remove('hidden');
            }
        });

        skillCardEl.addEventListener('mouseout', function() {
            tooltipElement.classList.add('hidden');
        });

        skillCardEl.dataset.hoverListener = 'true';
    }
}

/** @brief Elemento global de tooltip de nodos (#node-tooltip). */
const tooltip = document.getElementById('node-tooltip');

/**
 * @brief Muestra información rápida del nodo en el tooltip.
 * @param {HTMLElement|Event} nodeElement - elemento o evento para posicionar.
 * @param {Node} nodeData - instancia de Node a mostrar.
 */
function showTooltip(nodeElement, nodeData) {
    const stats = nodeData.getStats();

    let content = `
        <p><strong>Nodo:</strong> ${nodeData.id}</p>
        <p><strong>Dueño:</strong> ${nodeData.owner}</p>
        <p><strong>Tropas:</strong> <strong>${nodeData.troops}</strong> / ${stats.space}</p>
        <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.3); margin: 4px 0;">
        <p><strong>Vida Total:</strong> 🛡️ <strong>${stats.totalLife}</strong></p>
        <p><strong>Ataque Total:</strong> ⚔️ <strong>${stats.totalAttack}</strong></p>
    `;

    if (nodeData.defenseTurns > 0) {
        content += `<p>Defensa Activa: ${nodeData.defenseTurns} turno(s)</p>`;
    }
    if (nodeData.shieldActive) {
        content += `<p style="color: lightblue;">Escudo de Capuchos activo</p>`;
    }

    tooltip.innerHTML = content;
    tooltip.classList.remove('hidden');
    positionTooltip(nodeElement);
}

/**
 * @brief Oculta el tooltip global.
 */
function hideTooltip() {
    tooltip.classList.add('hidden');
}

/**
 * @brief Posiciona el tooltip en pantalla (evita salirse de la ventana).
 * @param {Event|HTMLElement} e - evento de mouse o elemento para posicionar.
 */
function positionTooltip(e) {
    let x, y;

    if (e && e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
    } else if (e && e.getBoundingClientRect) {
        const rect = e.getBoundingClientRect();
        x = rect.left + window.scrollX + rect.width / 2;
        y = rect.top + window.scrollY - 10;
    } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
    }

    const tooltipWidth = tooltip.offsetWidth || 200;
    const tooltipHeight = tooltip.offsetHeight || 100;

    let finalX = x + 15;
    let finalY = y + 15;

    if (finalX + tooltipWidth > window.innerWidth) {
        finalX = x - tooltipWidth - 15;
    }
    if (finalY + tooltipHeight > window.innerHeight) {
        finalY = window.innerHeight - tooltipHeight - 10;
    }

    tooltip.style.left = `${finalX}px`;
    tooltip.style.top = `${finalY}px`;
}

/* ========================================================================
   FIN DE JUEGO Y UTILIDADES
   ======================================================================== */

/**
 * @brief Comprueba condiciones de fin de juego (victoria/derrota).
 * @return {boolean} true si el juego terminó.
 */
function checkGameOver() {
    const nodes = Object.values(gameState.nodes);

    const playerNodes = nodes.filter(n => n.owner === gameState.playerFaction).length;
    const aiNodes = nodes.filter(n => n.owner === gameState.aiFaction).length;
    const totalNodes = nodes.length;

    if (aiNodes === 0 || playerNodes === totalNodes) {
        endGame('¡VICTORIA!', 'Has conquistado el territorio y derrotado a la facción enemiga.');
        return true;
    }

    if (playerNodes === 0) {
        endGame('¡DERROTA!', 'Tu facción ha sido completamente eliminada.');
        return true;
    }

    return false;
}

/**
 * @brief Muestra pantalla final y deshabilita controles básicos.
 * @param {string} message - título o mensaje principal.
 * @param {string} [details] - detalles opcionales a mostrar.
 */
function endGame(message, details) {
    document.getElementById('end-game-message').innerHTML = `
        <h1>${message}</h1>
        <p>${details || ''}</p>
    `;
    document.getElementById('end-game-screen').classList.remove('hidden');
    document.getElementById('control-panel').style.pointerEvents = 'none';
}

/**
 * @brief Ejecuta la transferencia de tropas entre nodos.
 * @param {Node} sourceNode - nodo origen.
 * @param {Node} targetNode - nodo destino.
 * @param {number} amount - cantidad solicitada a transferir.
 */
function executeTransfer(sourceNode, targetNode, amount) {
    const targetStats = targetNode.getStats();

    const maxCapacity = targetStats.space;
    const currentTroops = targetNode.troops;
    const availableSpace = maxCapacity - currentTroops;

    let actualTransfer = Math.min(amount, availableSpace);

    if (actualTransfer <= 0) {
        displayMessage("El nodo destino está lleno o no hay espacio disponible.", 'error');
        return;
    }

    sourceNode.troops -= actualTransfer;
    targetNode.troops += actualTransfer;

    sourceNode.updateVisuals();
    targetNode.updateVisuals();
    updateUI();
    displayMessage(`Transferidos ${actualTransfer} tropas de ${sourceNode.name} a ${targetNode.name}.`, 'success');
}

/**
 * @brief Configura el hover del tooltip de la tarjeta de habilidad (skill).
 * @note Debe llamarse después de que el DOM y el estado estén inicializados.
 */
function setupSkillHover() {
    const skillElement = document.getElementById('skill-card');
    const tooltipElement = document.getElementById('skill-tooltip');

    if (!skillElement || !tooltipElement) return;

    skillElement.onmouseover = function(e) {
        const faction = gameState.playerFaction;
        const skill = FACTIONS[faction]?.skill;

        if (skill) {
            tooltipElement.innerHTML = `
                <h4>${skill.name} (${skill.cooldown} turnos)</h4>
                <p>${skill.description}</p>
            `;
            tooltipElement.style.left = (e.pageX + 10) + 'px';
            tooltipElement.style.top = (e.pageY - 10) + 'px';
            tooltipElement.classList.remove('hidden');
        }
    };

    skillElement.onmouseout = function() {
        tooltipElement.classList.add('hidden');
    };
}

/* Inicializar hover de skill (si el DOM ya tiene los elementos) */
setupSkillHover();

/* ========================================================================
   Mensajes / utilidades
   ======================================================================== */

/**
 * @brief Muestra un mensaje temporal en pantalla (elemento #message-box requerido).
 * @param {string} text - texto a mostrar.
 * @param {string} type - 'info'|'success'|'warning'|'error' (clase CSS).
 */
function displayMessage(text, type = 'info') {
    const box = document.getElementById('message-box');
    if (!box) {
        console.log(`[${type}] ${text}`);
        return;
    }
    box.textContent = text;

    box.className = '';
    box.classList.add(type);

    box.classList.remove('hidden');
    setTimeout(() => box.classList.add('hidden'), 2000);
}

/* ========================================================================
   FIN DEL ARCHIVO
   ======================================================================== */
