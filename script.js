// ====================================================================================
//                                 CONFIGURACIÓN DEL JUEGO
// ====================================================================================

const NODE_DATA = [
    // Se asume que las coordenadas (X, Y) ya están ajustadas al área del mapa (0-920)
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

const ADJACENCY_LIST = {
    // ... (Lista de Adyacencias sin cambios) ...
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

// Asegurar bidireccionalidad de las conexiones (grafo no dirigido)
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

const FACTIONS = {
    'ESMAD': {
        color: 'var(--color-esmad)',
        icon: 'assets/esmad_tanqueta.png',
        name: 'ESMAD',
        // Vida, Ataque, Espacio
        baseStats: { life: 20, attack: 10, space: 16 }, 
        skill: {
            name: 'Ataque con Tanqueta',
            cooldown: 2,
            effect: 'Aumenta el ataque en un 50% por este turno.',
            icon: 'assets/esmad_skill.png',
            trigger: 'defend',
            // 🚩 DESCRIPCIÓN MOVIDA AQUÍ para el Tooltip
            description: "Otorga un aumento significativo al ataque del nodo seleccionado para el siguiente combate."
        },
        // Se elimina la propiedad description de este nivel
    },
    'Capuchos': {
        color: 'var(--color-capuchos)',
        icon: 'assets/capuchos_chaza.png',
        name: 'Capuchos',
        // Vida, Ataque, Espacio
        baseStats: { life: 12, attack: 14, space: 20 }, 
        skill: {
            name: 'Escudo de Primera Línea',
            cooldown: 3,
            effect: 'Reduce el daño del siguiente ataque recibido en un 50% (en el nodo objetivo).',
            icon: 'assets/capuchos_skill.png',
            trigger: 'attack',
            // 🚩 DESCRIPCIÓN MOVIDA AQUÍ para el Tooltip
            description: "Activa un escudo defensivo en el nodo seleccionado, negando el daño del primer ataque enemigo."
        },
        // Se elimina la propiedad description de este nivel
    },
    'Minga': {
        color: 'var(--color-minga)',
        icon: 'assets/minga_carpa.png',
        name: 'Minga',
        // Vida, Ataque, Espacio
        baseStats: { life: 10, attack: 10, space: 26 }, 
        skill: {
            name: 'Duplicar Tropas',
            cooldown: 4,
            effect: 'Duplica las tropas de un nodo (hasta el límite de espacio).',
            icon: 'assets/minga_skill.png',
            trigger: 'produce',
            // 🚩 DESCRIPCIÓN MOVIDA AQUÍ para el Tooltip
            description: "Duplica las tropas en el nodo seleccionado, limitado por el espacio máximo del nodo."
        },
        // Se elimina la propiedad description de este nivel
    }
};
const INITIAL_MONEY = 0;
const TROOP_UPGRADE_COST = 20;
const ACTION_UPGRADE_COSTS = [15, 30]; // N1 -> N2 (15), N2 -> N3 (30)

// ====================================================================================
//                                 ESTADO DEL JUEGO
// ====================================================================================

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

// ====================================================================================
//                                 CLASES Y FUNCIONES BASE
// ====================================================================================

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
        // ¡IMPORTANTE! Se corrige el contenedor de los nodos a 'game-area'
        this.element = this.createVisualElement(); 
    }

    createVisualElement() {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node Neutral';
        // Asignar ID en el formato que espera el listener para buscar en gameState.nodes
        nodeDiv.id = this.id; 
        
        // Ajustar la posición para centrar el hexágono (48x48)
        nodeDiv.style.left = `${this.x - 24}px`;
        nodeDiv.style.top = `${this.y - 24}px`;

        // Solo se necesita el contador de tropas y la información básica
        nodeDiv.innerHTML = `
            <span class="node-troop-count">0</span>
        `;
        // Nota: Eliminamos el <div class="node-tooltip"> obsoleto

        // --- ASIGNACIÓN DE LISTENERS PARA TOOLTIP (NUEVO) ---
        // 1. Mostrar tooltip al entrar
        nodeDiv.addEventListener('mouseover', (e) => {
            // Usamos this.id directamente ya que es el ID del nodo
            const nodeData = gameState.nodes[this.id]; 
            if (nodeData) {
                showTooltip(nodeDiv, nodeData);
            }
        });

        // 2. Mover tooltip con el cursor
        nodeDiv.addEventListener('mousemove', (e) => {
            positionTooltip(e);
        });

        // 3. Ocultar tooltip al salir
        nodeDiv.addEventListener('mouseout', hideTooltip);
        // --- FIN LISTENERS TOOLTIP ---
        
        nodeDiv.addEventListener('click', () => handleNodeClick(this.id));
        document.getElementById('game-area').appendChild(nodeDiv);
        return nodeDiv;
    }
    
    // ... (Resto de métodos de Node: getStats, updateVisuals sin cambios) ...
    getStats() {
        if (this.owner === 'Neutral' || this.troops === 0) {
            return { totalLife: 0, totalAttack: 0, space: 0 };
        }

        const faction = FACTIONS[this.owner];
        const base = faction.baseStats;
        const levelBonus = (gameState.troopLevel - 1) * 0.05; // +5% por nivel (Max 9 niveles, 45%)

        const lifePerTroop = base.life * (1 + levelBonus);
        const attackPerTroop = base.attack * (1 + levelBonus);
        const maxSpace = base.space * (1 + levelBonus);

        let totalLife = Math.round(this.troops * lifePerTroop);
        let totalAttack = Math.round(this.troops * attackPerTroop);

        // Nivel de defensa
        const defenseLevel = gameState.actionLevels.defend;
        let defenseBonus = 0;
        if (this.defenseTurns > 0) {
            defenseBonus = 0.10 * defenseLevel; // N1: +10%, N2: +20%, N3: +30% de vida
        }
        totalLife = Math.round(totalLife * (1 + defenseBonus));

        return {
            totalLife: totalLife,
            totalAttack: totalAttack,
            space: Math.round(maxSpace)
        };
    }

    updateVisuals() {
        // const stats = this.getStats(); // No es necesario en visuals
        this.element.querySelector('.node-troop-count').textContent = this.troops;
        
        // Actualizar clase y color
        this.element.className = `node ${this.owner}`;

        // Eliminar icono si es neutral o si tiene 0 tropas
        let iconEl = this.element.querySelector('.node-icon');
        if (this.owner !== 'Neutral' && this.troops > 0) {
            if (!iconEl) {
                iconEl = document.createElement('img');
                iconEl.className = 'node-icon';
                this.element.appendChild(iconEl);
            }
            // Corregido: el icono de la facción se llama 'faccion_nombre.png'
            iconEl.src = `assets/faccion_${this.owner.toLowerCase()}.png`; 
            iconEl.style.display = 'block';
        } else {
            if (iconEl) iconEl.style.display = 'none';
        }
    }
}

// ====================================================================================
//                                 GEOMETRÍA Y VISUALES
// ====================================================================================

/**
 * Dibuja las líneas de conexión entre nodos adyacentes usando el Canvas.
 * Esto asegura que las líneas estén detrás de los nodos y sean dinámicas.
 */
function drawConnections() {
    const canvas = document.getElementById('connection-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Usamos un Set para evitar dibujar líneas dobles (A -> B y B -> A)
    const drawnConnections = new Set();

    for (const nodeId in GAME_ADJACENCY_LIST) {
        const nodeA = gameState.nodes[nodeId];
        if (!nodeA) continue; 
        
        GAME_ADJACENCY_LIST[nodeId].forEach(neighborId => {
            const nodeB = gameState.nodes[neighborId];
            if (!nodeB) return;
            
            // Crea una clave única para la conexión (orden alfabético para bidireccionalidad)
            const connectionKey = [nodeA.id, nodeB.id].sort().join('-');

            if (!drawnConnections.has(connectionKey)) {
                ctx.beginPath();
                // Coordenadas X, Y del centro del nodo
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                drawnConnections.add(connectionKey); 
            }
        });
    }
}

function triggerSkillAnimation(node, faction) {
    // ... (Lógica de la animación sin cambios) ...
    const animEl = document.createElement('div');
    animEl.className = `skill-animation ${faction.toLowerCase()}-skill-anim`;
    // Centrar la animación sobre el nodo
    animEl.style.left = `${node.x - 32}px`;
    animEl.style.top = `${node.y - 32}px`;
    
    document.getElementById('game-area').appendChild(animEl);

    // Eliminar después de que termine la animación
    setTimeout(() => {
        animEl.remove();
    }, 800);
}


// ... (Toda la configuración, estado del juego, Node Class, drawConnections, etc., sin cambios) ...

// ====================================================================================
//                                 INICIALIZACIÓN (¡Corregida!)
// ====================================================================================

/**
 * Función que maneja la selección de facción al inicio.
 */
function selectFaction(e) {
    // **CORRECCIÓN CLAVE:** Usar 'closest' para encontrar el botón que contiene 'data-faction'.
    const clickedButton = e.target.closest('.faction-btn'); 
    
    if (!clickedButton) return; // Si no encontró un botón, salir.

    // 1. Obtener la facción del atributo data-faction del botón
    const faction = clickedButton.dataset.faction; 
    
    if (faction) {
        gameState.playerFaction = faction;
        
        // 2. Ocultar pantalla de inicio
        document.getElementById('start-screen').classList.add('hidden');
        
        // 3. Continuar con la inicialización del juego (crear nodos y comenzar turnos)
        setupGameWorld();
    }
}

// ... (El resto de la función setupGameWorld() sin cambios) ...

function setupGameWorld() {
    const playerFaction = gameState.playerFaction;
    
    // Asignar facción de la IA
    const availableFactions = Object.keys(FACTIONS).filter(f => f !== playerFaction);
    const aiFactionIndex = Math.floor(Math.random() * availableFactions.length);
    gameState.aiFaction = availableFactions[aiFactionIndex];
    
    // Asignación de nodos iniciales
    const startNodes = NODE_DATA.filter(n => n.startNode);
    if (startNodes.length < 2) {
        console.error("No hay suficientes nodos iniciales marcados.");
        return;
    }
    const shuffledStartNodes = startNodes.sort(() => 0.5 - Math.random());
    
    const playerStartNode = shuffledStartNodes.pop().id;
    const aiStartNode = shuffledStartNodes.pop().id;

    // 1. Crear Nodos
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

    // 2. Dibujar conexiones y comenzar
    drawConnections();
    updateUI();
    startTurn();

    // ... dentro de la función que crea o inicializa tus nodos, e.g., setupGameWorld()

    // Ejemplo de cómo adjuntar listeners a un nodo 'nodeElement' y 'nodeData'
    // (Asegúrate de que 'nodeElement' sea la referencia al DIV/botón del nodo)
    nodeElement.addEventListener('mouseover', (e) => {
        // Busca la data del nodo, asumiendo que el ID está en el elemento
        const nodeId = nodeElement.id; 
        const nodeData = gameState.nodes[nodeId];

        if (nodeData) {
            showTooltip(nodeElement, nodeData);
        }
    });

    nodeElement.addEventListener('mousemove', (e) => {
        // Mueve el tooltip para que siga el cursor
        positionTooltip(e);
    });

    nodeElement.addEventListener('mouseout', hideTooltip);

}

/**
 * Función principal llamada al cargar el DOM.
 * Solo muestra la pantalla de selección de facción si es necesario.
 */
function initGame() {
    if (!gameState.playerFaction) {
        // Mostrar la pantalla de inicio
        document.getElementById('start-screen').classList.remove('hidden');
    } else {
        // Si por alguna razón la facción ya está seteada, iniciar directamente.
        setupGameWorld();
    }
}

// ====================================================================================
// ====================================================================================
//                                 MANEJO DE TURNOS
// ====================================================================================

function startTurn() {
    gameState.turn++;
    gameState.currentPlayer = 'Player';
    gameState.actionsLeft = calculateMaxActions(gameState.playerFaction);
    gameState.selectedNode = null;
    
    // Cooldown y defensa
    Object.values(gameState.nodes).forEach(node => {
        // Reducir defensa
        if (node.defenseTurns > 0) {
            node.defenseTurns--;
        }
    });

    // Reducir cooldown de habilidad
    if (gameState.skillCooldown > 0) {
        gameState.skillCooldown--;
    }

    // Generar dinero y tropas
    generateResources();
    
    updateUI();
    document.getElementById('turn-text').textContent = "Tu Turno";
    document.getElementById('turn-counter').textContent = `T: ${gameState.turn}`;
    document.getElementById('end-turn-btn').disabled = false;
}

// ====================================================================================
//                          FUNCIÓN GENERATE RESOURCES (CORREGIDA)
// ====================================================================================

function generateResources() {
    let playerMoneyGained = 0;
    
    // 1. Calcular la producción pasiva (usa los niveles de mejora globales)
    const produceLevel = gameState.actionLevels.produce;
    let productionBonus = 0;
    if (produceLevel === 2) productionBonus = 1; // +1 tropa
    if (produceLevel === 3) productionBonus = 2; // +2 tropas
    const passiveProduction = 1 + productionBonus; // 1 base + mejora

    // 2. Iterar sobre todos los nodos
    Object.values(gameState.nodes).forEach(node => {
        
        // --- LÓGICA PARA EL JUGADOR ---
        if (node.owner === gameState.playerFaction) {
            playerMoneyGained++; // 1 moneda por nodo propio
            
            const stats = node.getStats();
            if (node.troops < stats.space) {
                // Aplica producción pasiva al jugador
                node.troops = Math.min(node.troops + passiveProduction, stats.space);
                node.updateVisuals();
            }
        } 
        // --- LÓGICA PARA LA IA (AÑADIDA) ---
        else if (node.owner === gameState.aiFaction) {
             // La IA no gana dinero (usa el presupuesto implícito/global), pero sí tropas pasivas.
            const stats = node.getStats();
            if (node.troops < stats.space) {
                // Aplica producción pasiva a la IA
                node.troops = Math.min(node.troops + passiveProduction, stats.space);
                node.updateVisuals();
            }
        }
    });
    
    // 3. Aplicar el dinero al estado del juego (solo para el jugador)
    gameState.money += playerMoneyGained;
}

function calculateMaxActions(faction) {
    const controlledNodes = Object.values(gameState.nodes).filter(n => n.owner === faction).length;
    // 1 nodo = 1 acción, 2 nodos = 2 acciones, 3 nodos = 3 acciones, 4+ nodos = 4 acciones
    return Math.min(controlledNodes, 4);
}

document.getElementById('end-turn-btn').addEventListener('click', () => {
    document.getElementById('end-turn-btn').disabled = true;
    gameState.currentPlayer = 'AI';
    updateUI();
    document.getElementById('turn-text').textContent = "Turno de la IA...";
    setTimeout(aiTurn, 1000); // Pequeño retraso para simular "pensamiento"
});

// ====================================================================================
//                              MANEJO DE TURNOS (IA)
// ====================================================================================

function aiTurn() {
    const ai = new AI(gameState.aiFaction);
    
    // 1. Obtener y ejecutar acciones
    const actions = ai.getActions();
    
    // Calcular el tiempo total de ejecución de las acciones
    const actionDelayTime = 500; // 0.5 segundos por acción
    let totalDelay = 0;
    
    actions.forEach((action) => {
        // Ejecutar cada acción con un retraso secuencial
        setTimeout(() => {
            ai.executeAction(action);
            updateUI(); // Actualizar UI después de la acción
        }, totalDelay);
        totalDelay += actionDelayTime; 
    });
    
    // ... dentro de aiTurn()
    // 2. Lógica de Fin de Turno ÚNICA (Se ejecuta después de todas las acciones)
    setTimeout(() => {
        // Ejecutar mejoras después de las acciones (ESTO SE ELIMINARÁ/MOVERÁ EN LA PARTE 2)
        // ai.upgradeIfPossible(); // <-- MANTENER POR AHORA, LO ELIMINAREMOS EN LA PARTE 2
        
        // Verificar si el juego ha terminado
        if (!checkGameOver()) {
            // Finalizar el turno y empezar el siguiente.
            gameState.currentPlayer = 'Player';
            startTurn(); 
        }
        
    }, totalDelay + 500); // Se añade un retraso final
    //  // Se añade un retraso final de 0.5s para la visualización de la última acción/mejora
}
// Asegúrate de que esta clase reemplace completamente la versión anterior de la clase AI

// ====================================================================================
//                              CLASE INTELIGENCIA ARTIFICIAL (AI)
// ====================================================================================

class AI {
    constructor(faction) {
        this.faction = faction;
        this.actionsLeft = calculateMaxActions(faction);
    }
    
    // --- Lógica de Decisión (Determina qué hacer) ---
    // --- Lógica de Decisión (Mejorada para reconocer el desgaste) ---
    getActions() {
        const actionQueue = [];
        const myNodes = Object.values(gameState.nodes).filter(n => n.owner === this.faction);
        const usedNodes = new Set(); // Restringe 1 acción principal (A/D/P) por nodo.
        
        for (const myNode of myNodes) {
            if (this.actionsLeft <= 0) break;
            if (usedNodes.has(myNode.id)) continue;
            
            const myStats = myNode.getStats();
            const adjacents = GAME_ADJACENCY_LIST[myNode.id].map(id => gameState.nodes[id]);
            let actionSelected = false;

            // P1: ATAQUE ⚔️ (Aprovecha el desgaste: Ataque > Vida objetivo)
            if (myNode.troops > 1) {
                // Elige el nodo enemigo adyacente más débil (que sea conquistable).
                const target = adjacents.filter(n => n.owner !== this.faction)
                                        .sort((a, b) => a.getStats().totalLife - b.getStats().totalLife) // Ordenar por vida (más débil primero)
                                        .find(n => myStats.totalAttack > n.getStats().totalLife); // Encuentra el primero que puede conquistar
                
                if (target) {
                    actionQueue.push({ type: 'attack', source: myNode.id, target: target.id });
                    actionSelected = true;
                }
            }
            
            if (actionSelected) {
                 this.actionsLeft--;
                 usedNodes.add(myNode.id); // Este nodo ya usó su acción principal
                 continue; 
            }

            // P2: DEFENSA 🛡️ (Lógica sin cambios)
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

            // P3: PRODUCCIÓN 🌱 (Lógica sin cambios)
            if (myNode.troops < myStats.space) {
                 actionQueue.push({ type: 'produce', source: myNode.id });
                 this.actionsLeft--;
                 usedNodes.add(myNode.id);
            }
            // P4: TRANSFERENCIA (Consolidar tropas en nodos de defensa/frontera)
            // Se busca mover el exceso de tropas de nodos internos a nodos más importantes.
            
            const internalNodes = Object.values(gameState.nodes).filter(n => 
                n.owner === this.faction && n.troops > 1 && 
                GAME_ADJACENCY_LIST[n.id].every(adjId => gameState.nodes[adjId].owner === this.faction) // Nodos rodeados por amigos
            );

            if (internalNodes.length > 0) {
                const source = internalNodes[0];
                const adjacentFriendly = GAME_ADJACENCY_LIST[source.id]
                                          .map(id => gameState.nodes[id])
                                          .filter(n => n.owner === this.faction)
                                          .sort((a, b) => a.troops - b.troops); // Priorizar mover a nodos con menos tropas (para balancear)

                if (adjacentFriendly.length > 0) {
                     // Mueve 1/3 de las tropas excedentes, dejando siempre 1.
                     const transferAmount = Math.floor((source.troops - 1) / 3); 
                     if (transferAmount > 0) {
                        actionQueue.push({ 
                            type: 'transfer', 
                            source: source.id, 
                            target: adjacentFriendly[0].id, 
                            amount: transferAmount 
                        });
                        // La transferencia NO consume acción de turno.
                        // usedNodes.add(source.id); // No se marca como usado para que pueda producir/atacar si es necesario.
                        continue;
                     }
                }
            }
        } // Fin del bucle for
        return actionQueue;
    }
    
    // --- Lógica de Ejecución (Implementa la acción y la habilidad) ---
    executeAction(action) {
        const sourceNode = gameState.nodes[action.source];
        const skillReady = gameState.skillCooldown === 0;
        
        // --- Activación de Habilidad (Antes de la acción base) ---
        if (skillReady) {
            const skill = FACTIONS[this.faction].skill;
            
            // ESMAD (DEFENSA): Habilidad al defender
            if (this.faction === 'ESMAD' && action.type === 'defend') {
                sourceNode.defenseTurns = gameState.actionLevels.defend + 1; // +1 turno extra
                sourceNode.shieldActive = true; 
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            
            // CAPUCHOS (ATAQUE): Habilidad al atacar
            } else if (this.faction === 'Capuchos' && action.type === 'attack') {
                // Aplica escudo defensivo al nodo atacante.
                sourceNode.shieldActive = true; 
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            
            // MINGA (PRODUCCIÓN): Habilidad al producir
            } else if (this.faction === 'Minga' && action.type === 'produce') {
                // Duplica tropas.
                const stats = sourceNode.getStats();
                const newTroops = Math.min(sourceNode.troops * 2, stats.space);
                sourceNode.troops = newTroops;
                sourceNode.updateVisuals();
                triggerSkillAnimation(sourceNode, this.faction);
                gameState.skillCooldown = skill.cooldown;
            }
        }

        // --- Ejecución de la Acción Base ---
        if (action.type === 'attack') {
            const targetNode = gameState.nodes[action.target];
            if (sourceNode.troops > 1) {
                executeAttack(sourceNode, targetNode);
            }
        } else if (action.type === 'defend') {
            // Solo defiende si no lo hizo con la habilidad ESMAD y si aún no tiene defensa.
            if (sourceNode.owner === this.faction && sourceNode.defenseTurns === 0) {
                sourceNode.defenseTurns = gameState.actionLevels.defend;
            }
        } else if (action.type === 'produce') {
            const stats = sourceNode.getStats();
            
            // Si es Minga Y usó la habilidad, la producción ya se hizo arriba (duplicación).
            // Si no es Minga, o si Minga no pudo usar la habilidad (por cooldown), procede con la producción normal.
            const producedBySkill = (this.faction === 'Minga' && skillReady && action.type === 'produce');

            if (!producedBySkill && sourceNode.owner === this.faction) {
                const produceLevel = gameState.actionLevels.produce;
                let production = produceLevel;
                
                sourceNode.troops = Math.min(sourceNode.troops + production, stats.space);
                sourceNode.updateVisuals();
            }
        } else if (action.type === 'transfer') {
            const targetNode = gameState.nodes[action.target];
            // Reutilizamos la lógica, ya que la IA es el único que llama a esto.
            executeTransfer(sourceNode, targetNode, action.amount);
        }
    }

    // --- Lógica de Mejoras (Siempre que pueda, lo hará) ---
    upgradeIfPossible() {
        // Prioridad: 1. Tropas > 2. Producción > 3. Ataque > 4. Defensa
        
        // 1. Mejorar Tropas
        let troopCost = TROOP_UPGRADE_COST * gameState.troopLevel;
        if (gameState.money >= troopCost && gameState.troopLevel < 10) {
            handleUpgrade('troop');
            return; 
        }

        // 2. Mejorar Producción
        if (gameState.actionLevels.produce < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.produce - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'produce');
                return;
            }
        }

        // 3. Mejorar Ataque
        if (gameState.actionLevels.attack < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.attack - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'attack');
                return;
            }
        }
        
        // 4. Mejorar Defensa
        if (gameState.actionLevels.defend < 3) {
            let cost = ACTION_UPGRADE_COSTS[gameState.actionLevels.defend - 1];
            if (gameState.money >= cost) {
                handleUpgrade('action', 'defend');
                return;
            }
        }
    }
}

// ====================================================================================
//                                 INICIO DEL JUEGO
// ====================================================================================

// **Se asignan los listeners de facción aquí, para que estén listos antes de que initGame se ejecute.**
document.addEventListener('DOMContentLoaded', () => {
    // Asignar listeners a los botones de facción
    document.querySelectorAll('.faction-btn').forEach(btn => {
        // Si tienes elementos dentro del botón, el 'closest' en selectFaction manejará el clic.
        btn.addEventListener('click', selectFaction);
    });
    
    // Iniciar el chequeo principal
    initGame();
});

// ====================================================================================
//                                 INTERACCIÓN DEL JUGADOR
// ====================================================================================

function handleNodeClick(nodeId) {
    const targetNode = gameState.nodes[nodeId];
    
    if (gameState.currentPlayer !== 'Player') return;

    // 1. Selección inicial
    if (gameState.selectedNode === null) {
        if (targetNode.owner === gameState.playerFaction) {
            gameState.selectedNode = nodeId;
            document.querySelectorAll('.node').forEach(el => el.classList.remove('selected'));
            targetNode.element.classList.add('selected');
        }
        return;
    }

    const sourceNode = gameState.nodes[gameState.selectedNode];
    
    // 2. Deselección (Clic en el mismo nodo)
    if (sourceNode === targetNode) {
        sourceNode.element.classList.remove('selected'); // ✅ Deselección aquí
        gameState.selectedNode = null;
        updateUI();
        return;
    }
    
    // 3. Ejecutar Acción / Transferencia
    const isAdjacent = GAME_ADJACENCY_LIST[sourceNode.id].includes(targetNode.id);

    if (!isAdjacent) {
        // Lógica de re-selección
        sourceNode.element.classList.remove('selected'); // ✅ Deselección aquí
        gameState.selectedNode = null;

        if (targetNode.owner === gameState.playerFaction) {
             gameState.selectedNode = nodeId;
             targetNode.element.classList.add('selected');
        }
        updateUI();
        return;
    }

    // --- TRANSFERENCIA DE TROPAS ---
    if (targetNode.owner === gameState.playerFaction) {
        
        const maxTransfer = sourceNode.troops - 1;
        let transferCompleted = false; // Flag para rastrear si la transferencia se hizo

        if (maxTransfer <= 0) {
            displayMessage("No hay tropas suficientes para transferir. Necesitas al menos 2.", 'error');
        } else {
            // Usamos un try/catch para manejar mejor la cancelación o errores del prompt
            try {
                let transferAmount = prompt(`¿Cuántas tropas deseas mover de ${sourceNode.name} a ${targetNode.name}? (Máximo: ${maxTransfer})`);
                transferAmount = parseInt(transferAmount);

                if (!isNaN(transferAmount) && transferAmount > 0 && transferAmount <= maxTransfer) {
                    executeTransfer(sourceNode, targetNode, transferAmount);
                    transferCompleted = true;
                } else if (transferAmount !== null) { // Si no es null (no se canceló) pero es inválido
                    displayMessage("Transferencia cancelada o cantidad inválida.", 'warning');
                }
            } catch (e) {
                // Capturar errores del prompt (aunque es raro)
                console.error("Error durante el prompt de transferencia:", e);
                displayMessage("Error al procesar la transferencia.", 'error');
            }
        }
        
        // Finalizar la interacción de transferencia
        sourceNode.element.classList.remove('selected'); // ✅ Deselección aquí
        gameState.selectedNode = null;
        updateUI();
        return;
    }

    // --- ATAQUE ---
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
    
    // 4. Finalizar la interacción (Después de un ataque)
    sourceNode.element.classList.remove('selected'); // ✅ Deselección aquí
    gameState.selectedNode = null;
    updateUI();
}

// ====================================================================================
//                                 MOTOR DE COMBATE
// ====================================================================================

// ====================================================================================
//                              FUNCIÓN DE COMBATE
// ====================================================================================

function executeAttack(attackerNode, defenderNode) {
    if (attackerNode.owner === defenderNode.owner || attackerNode.troops <= 1) return; 

    const attackerStats = attackerNode.getStats();
    const defenderStats = defenderNode.getStats();
    
    // Almacenar tropas iniciales para el cálculo de traslado y supervivencia
    const initialAttackerTroops = attackerNode.troops;

    // --- 1. Cálculo de Daño y Bajas ---
    
    const attackerDamage = attackerStats.totalAttack; 
    const defenderDamage = defenderStats.totalAttack; 

    // Bajas del defensor
    const defenderLifePerTroop = defenderNode.troops > 0 
                               ? defenderStats.totalLife / defenderNode.troops
                               : 1; 
    let defenderLostTroops = defenderNode.troops > 0 
                             ? Math.ceil(attackerDamage / defenderLifePerTroop) 
                             : 0;

    // Bajas del atacante (por contraataque)
    const attackerLifePerTroop = attackerNode.troops > 0 
                               ? attackerStats.totalLife / attackerNode.troops
                               : 1; 

    let attackerLostTroops = attackerNode.troops > 0 && defenderNode.troops > 0 
                             ? Math.ceil(defenderDamage / attackerLifePerTroop) 
                             : 0;

    // --- 2. Aplicar Bajas y Consumo de Habilidades ---

    // 2.1. Aplicar bajas al atacante
    attackerNode.troops = Math.max(0, attackerNode.troops - attackerLostTroops);
    
    // 2.2. Aplicar bajas al defensor
    let remainingDefenderTroops = defenderNode.troops - defenderLostTroops;
    
    // Consumo de defensa/escudo
    if (defenderNode.defenseTurns > 0) {
        defenderNode.defenseTurns--;
    }
    if (defenderNode.shieldActive) {
        defenderNode.shieldActive = false;
    }

    // --- 3. Verificación y Traslado de Conquista ---
    
    // Si las tropas del defensor llegan a cero o menos
    if (remainingDefenderTroops <= 0) { 
        
        // 1. Calcular tropas que sobreviven al combate
        const troopsSurvived = initialAttackerTroops - attackerLostTroops;
        
        // 2. El atacante debe tener al menos 1 tropa restante para iniciar la conquista
        if (troopsSurvived > 0) {
            
            // Tropas a mover: Todas menos 1 (si hay suficientes).
            // NOTA CLAVE: troopsToMove podría ser 0 (si troopsSurvived era 1).
            const troopsToMove = Math.max(0, troopsSurvived - 1); 
            const troopsRemainingInAttacker = troopsSurvived - troopsToMove;
            
            // Asignar nuevo dueño y trasladar tropas
            defenderNode.owner = attackerNode.owner;
            
            // REGLA DE CONQUISTA FORZOSA: Siempre que haya conquista, el nodo debe tener al menos 1 tropa.
            defenderNode.troops = Math.max(1, troopsToMove); // Mínimo 1 tropa
            
            // Dejar el nodo atacante con la tropa obligatoria.
            attackerNode.troops = troopsRemainingInAttacker;
            
            defenderNode.defenseTurns = 0;
            defenderNode.shieldActive = false;
        } else {
             // Si el atacante no sobrevivió, el defensor también cae a 0.
             // La limpieza a Neutral se manejará en el paso 4.
             defenderNode.troops = 0; 
        }
    } else {
        // El nodo defensor sobrevive. Mínimo 1 tropa.
        defenderNode.troops = Math.max(1, remainingDefenderTroops);
    }
    
    // --- 4. Liberación Universal (Limpieza final) ---
    // REGLA UNIVERSAL: Cualquier nodo en 0 tropas se vuelve Neutral.
    
    // Limpiar nodo atacante si perdió todas sus tropas
    if (attackerNode.troops === 0) {
        attackerNode.owner = 'Neutral';
    }
    
    // Limpiar nodo defensor si perdió todas sus tropas (y no fue conquistado)
    if (defenderNode.troops === 0 && defenderNode.owner !== attackerNode.owner) {
        defenderNode.owner = 'Neutral';
    }
    
    // Asegurar que si es Neutral, no tenga defensa/escudo residual
    if (attackerNode.owner === 'Neutral') {
        attackerNode.defenseTurns = 0;
        attackerNode.shieldActive = false;
    }
    if (defenderNode.owner === 'Neutral') {
        defenderNode.defenseTurns = 0;
        defenderNode.shieldActive = false;
    }
    
    // 5. Actualizar Visuales
    attackerNode.updateVisuals();
    defenderNode.updateVisuals();
}

function checkWinCondition(lastConqueror) {
    const remainingFactions = new Set(Object.values(gameState.nodes).map(n => n.owner).filter(o => o !== 'Neutral'));

    if (remainingFactions.size <= 1) {
        // Queda solo un dueño (o nadie)
        let winner = lastConqueror;
        if (remainingFactions.size === 1) {
            winner = remainingFactions.values().next().value;
        }

        const message = winner === gameState.playerFaction ? "¡Victoria! Has conquistado todo el territorio." : "Derrota. La IA ha ganado.";
        showEndGame(message);
    }
}

function showEndGame(message) {
    document.getElementById('end-game-message').textContent = message;
    document.getElementById('end-game-screen').classList.remove('hidden');
}


// ====================================================================================
//                                 MEJORAS Y HABILIDADES
// ====================================================================================

function handleUpgrade(type, actionName = null) {
    let currentLevel, cost;
    
    if (type === 'troop') {
        currentLevel = gameState.troopLevel;
        if (currentLevel >= 10) return;
        cost = TROOP_UPGRADE_COST * currentLevel; // Costo creciente
        
    } else if (type === 'action') {
        currentLevel = gameState.actionLevels[actionName];
        if (currentLevel >= 3) return;
        cost = ACTION_UPGRADE_COSTS[currentLevel - 1]; // Costo N1->N2, N2->N3
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

document.getElementById('upgrade-troop-btn').addEventListener('click', () => handleUpgrade('troop'));
document.querySelectorAll('.upgrade-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => handleUpgrade('action', e.target.dataset.action));
});

// Implementación de acciones de jugador (Defensa/Producción)
document.getElementById('action-defend-btn').addEventListener('click', () => {
    if (gameState.actionsLeft <= 0 || !gameState.selectedNode) return;
    const node = gameState.nodes[gameState.selectedNode];
    
    if (node.owner !== gameState.playerFaction || node.defenseTurns > 0) return;

    node.defenseTurns = gameState.actionLevels.defend;
    gameState.actionsLeft--;

    // 🚩 Deselección OPTIMIZADA
    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    // document.querySelectorAll('.node').forEach(el => el.classList.remove('selected')); // <-- ELIMINADO
    updateUI();
});

document.getElementById('action-produce-btn').addEventListener('click', () => {
    if (gameState.actionsLeft <= 0 || !gameState.selectedNode) return;
    const node = gameState.nodes[gameState.selectedNode];
    
    if (node.owner !== gameState.playerFaction) return;

    // La producción se realiza al inicio del turno.
    // Esta acción de 'Producir' adicional simplemente añade una cantidad inmediata:
    const produceLevel = gameState.actionLevels.produce;
    let production = 1;
    if (produceLevel === 2) production = 2;
    if (produceLevel === 3) production = 3; 

    const stats = node.getStats();
    node.troops = Math.min(node.troops + production, stats.space);
    node.updateVisuals();
    
    gameState.actionsLeft--;
    
    // 🚩 Deselección OPTIMIZADA
    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    // document.querySelectorAll('.node').forEach(el => el.classList.remove('selected')); // <-- ELIMINADO
    updateUI();
});

// Habilidad
function handleSkillUse() {
    if (gameState.currentPlayer !== 'Player' || gameState.skillCooldown > 0) return;

    const faction = gameState.playerFaction;
    const skill = FACTIONS[faction].skill;

    // Las habilidades se usan en un nodo. Requiere que un nodo esté seleccionado.
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
            // Ataque con Tanqueta: Para la versión simple, la aplicaremos como un buff al nodo.
            alert("Habilidad ESMAD (Tanqueta) activada. Tu siguiente ataque será más fuerte.");
            node.attackBoost = true; // Se maneja en executeAttack
            break;
        case 'Capuchos':
            // Escudo: Reduce el daño del siguiente ataque.
            node.shieldActive = true;
            break;
        case 'Minga':
            // Duplicar tropas (limitado por espacio)
            const stats = node.getStats();
            const newTroops = Math.min(node.troops * 2, stats.space);
            node.troops = newTroops;
            node.updateVisuals();
            break;
    }
    
    gameState.skillCooldown = FACTIONS[gameState.playerFaction].skill.cooldown;
    
    // 🚩 Deselección OPTIMIZADA
    node.element.classList.remove('selected');
    gameState.selectedNode = null;
    // document.querySelectorAll('.node').forEach(el => el.classList.remove('selected')); // <-- ELIMINADO
    updateUI();
}

// Inicializar listener de habilidad (después de asignar la facción)
// Se asigna en updateUI al inicializar.

// ====================================================================================
//                                 ACTUALIZACIÓN DE UI
// ====================================================================================

function updateUI() {
    const faction = gameState.playerFaction;
    const factionData = FACTIONS[faction];
    const skill = factionData.skill;
    const skillCardEl = document.getElementById('skill-card');
    
    // Info General
    document.getElementById('faction-icon').src = `assets/faccion_${faction.toLowerCase()}.png`;
    document.getElementById('player-faction-name').textContent = factionData.name;
    document.getElementById('current-money').textContent = gameState.money;
    document.getElementById('actions-left-display').textContent = gameState.actionsLeft;

    // Stats de Tropas
    document.getElementById('troop-level-display').textContent = `Nivel ${gameState.troopLevel}`;
    const baseStats = FACTIONS[faction].baseStats;
    const levelBonus = (gameState.troopLevel - 1) * 0.05;
    document.getElementById('stat-vida').textContent = Math.round(baseStats.life * (1 + levelBonus));
    document.getElementById('stat-ataque').textContent = Math.round(baseStats.attack * (1 + levelBonus));
    document.getElementById('stat-espacio').textContent = Math.round(baseStats.space * (1 + levelBonus));

    const troopCost = TROOP_UPGRADE_COST * gameState.troopLevel;
    document.getElementById('troop-upgrade-cost').textContent = gameState.troopLevel < 10 ? `Costo: ${troopCost}` : 'Máx Nivel';
    document.getElementById('upgrade-troop-btn').disabled = gameState.troopLevel >= 10 || gameState.money < troopCost;


    // Niveles de Acción
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

    // ------------------------------------------------------------------
    // Habilidad (Incluyendo la lógica de Tooltip/Hover)
    // ------------------------------------------------------------------
    
    // Actualizar el contenido visual de la tarjeta de habilidad
    skillCardEl.style.borderColor = factionData.color;
    skillCardEl.innerHTML = `
        <img id="skill-icon-img" class="skill-card-icon" src="${skill.icon}" alt="Habilidad">
        <div class="skill-cooldown-text">C: ${gameState.skillCooldown}</div>
    `;
    skillCardEl.className = `skill-card ${gameState.skillCooldown === 0 ? 'available' : ''}`;
    
    // Solo asignar el listener de clic UNA VEZ.
    if (!skillCardEl.dataset.listener) {
        skillCardEl.addEventListener('click', handleSkillUse);
        skillCardEl.dataset.listener = 'true';
    }

    // --- Lógica de Hover para Tooltip ---
    // Usamos el contenedor principal skillCardEl para capturar el mouseover/mouseout
    const tooltipElement = document.getElementById('skill-tooltip'); // Asumiendo que existe
    
    if (tooltipElement) {
        // Adjuntar el evento de hover si aún no se ha hecho
        if (!skillCardEl.dataset.hoverListener) {
            
            skillCardEl.addEventListener('mouseover', function(e) {
                const skill = FACTIONS[gameState.playerFaction]?.skill;
                if (skill) {
                    // Mostrar la descripción
                    tooltipElement.innerHTML = `
                        <h4>${skill.name} (${skill.cooldown} turnos)</h4>
                        <p>${skill.description}</p>
                    `;
                    // Posicionar el tooltip cerca del cursor
                    tooltipElement.style.left = (e.pageX + 15) + 'px';
                    tooltipElement.style.top = (e.pageY + 15) + 'px';
                    tooltipElement.classList.remove('hidden');
                }
            });

            skillCardEl.addEventListener('mouseout', function() {
                // Ocultar la descripción
                tooltipElement.classList.add('hidden');
            });

            skillCardEl.dataset.hoverListener = 'true';
        }
    }
}

// Variable global para el elemento del tooltip
const tooltip = document.getElementById('node-tooltip');

function showTooltip(nodeElement, nodeData) {
    const stats = nodeData.getStats();
    
    // Contenido del tooltip
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
    // Actualizar posición de inmediato
    positionTooltip(nodeElement); 
}

function hideTooltip() {
    tooltip.classList.add('hidden');
}

function positionTooltip(e) {
    // Usamos el evento del mouse para seguir al cursor si se pasa como argumento
    // o el elemento para posicionarlo sobre el nodo si se pasa el elemento.
    let x, y;

    if (e.clientX && e.clientY) { // Si es un evento de mouse
        x = e.clientX;
        y = e.clientY;
    } else if (e.getBoundingClientRect) { // Si es un elemento DOM
        const rect = e.getBoundingClientRect();
        x = rect.left + window.scrollX + rect.width / 2;
        y = rect.top + window.scrollY - 10; // Posición justo encima
    }
    
    // Ajustar la posición para evitar que el tooltip se salga de la pantalla
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    
    // Posición por defecto: ligeramente a la derecha e inferior del cursor/nodo
    let finalX = x + 15;
    let finalY = y + 15;
    
    // Ajuste X: Si se va a salir por la derecha, muévelo a la izquierda del cursor
    if (finalX + tooltipWidth > window.innerWidth) {
        finalX = x - tooltipWidth - 15;
    }
    // Ajuste Y: Si se va a salir por abajo, muévelo encima del cursor
    if (finalY + tooltipHeight > window.innerHeight) {
        finalY = window.innerHeight - tooltipHeight - 10;
    }


    tooltip.style.left = `${finalX}px`;
    tooltip.style.top = `${finalY}px`;
}

function checkGameOver() {
    const nodes = Object.values(gameState.nodes);
    
    // 1. Contar nodos por facción
    const playerNodes = nodes.filter(n => n.owner === gameState.playerFaction).length;
    const aiNodes = nodes.filter(n => n.owner === gameState.aiFaction).length;
    const totalNodes = nodes.length;

    // 2. Condición de Victoria (El jugador gana)
    if (aiNodes === 0 || playerNodes === totalNodes) {
        endGame('¡VICTORIA!', 'Has conquistado el territorio y derrotado a la facción enemiga.');
        return true;
    }

    // 3. Condición de Derrota (La IA gana)
    if (playerNodes === 0) {
        endGame('¡DERROTA!', 'Tu facción ha sido completamente eliminada.');
        return true;
    }

    return false; // El juego continúa
}

// Función para manejar el fin del juego (Asume que tienes un div #end-game-screen)
function endGame(message, details) {
    document.getElementById('end-game-message').innerHTML = `
        <h1>${message}</h1>
        <p>${details}</p>
    `;
    document.getElementById('end-game-screen').classList.remove('hidden');
    // Deshabilitar controles si es necesario
    document.getElementById('control-panel').style.pointerEvents = 'none';
}

function executeTransfer(sourceNode, targetNode, amount) {
    const targetStats = targetNode.getStats();

    // 1. Calcular el espacio disponible en el destino
    const maxCapacity = targetStats.space;
    const currentTroops = targetNode.troops;
    const availableSpace = maxCapacity - currentTroops;

    let actualTransfer = Math.min(amount, availableSpace);

    if (actualTransfer <= 0) {
        displayMessage("El nodo destino está lleno o no hay espacio disponible.", 'error');
        return;
    }
    
    // 2. Ejecutar el movimiento
    sourceNode.troops -= actualTransfer;
    targetNode.troops += actualTransfer;

    // 3. Actualizar la UI
    sourceNode.updateVisuals();
    targetNode.updateVisuals();
    updateUI();
    displayMessage(`Transferidos ${actualTransfer} tropas de ${sourceNode.name} a ${targetNode.name}.`, 'success');
}

// La función updateUI debe asegurarse de que el elemento de la habilidad esté asociado a su evento.
function setupSkillHover() {
    const skillElement = document.getElementById('skill-card'); // O el elemento que quieras usar como disparador
    const tooltipElement = document.getElementById('skill-tooltip');
    
    if (!skillElement || !tooltipElement) return;

    // Función que se dispara al pasar el mouse por encima
    skillElement.onmouseover = function(e) {
        const faction = gameState.playerFaction;
        const skill = FACTIONS[faction]?.skill;

        if (skill) {
            tooltipElement.innerHTML = `
                <h4>${skill.name} (${skill.cooldown} turnos)</h4>
                <p>${skill.description}</p>
            `;
            // Posicionar el tooltip (ej. a la izquierda o debajo del mouse)
            tooltipElement.style.left = (e.pageX + 10) + 'px';
            tooltipElement.style.top = (e.pageY - 10) + 'px';
            tooltipElement.classList.remove('hidden');
        }
    };

    // Función que se dispara al quitar el mouse
    skillElement.onmouseout = function() {
        tooltipElement.classList.add('hidden');
    };
}

// Llama a esta función al inicio del juego, después de inicializar el HTML y el estado.
setupSkillHover();