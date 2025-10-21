import { StorageManager } from './storage.js';
import { PokemonAPI } from './api.js';
import { UI } from './ui.js';

export const PokemonController = {
    async searchPokemon() {
        try {
            const pokemonName = UI.getInputValue();

            if (pokemonName.length === 0) {
                throw new Error("El nombre del Pokémon es requerido");
            }

            const pokemonData = await PokemonAPI.getPokemon(pokemonName);

            UI.showSearchPreview(pokemonData, () => this.addPokemon(pokemonData));

            console.log("Pokémon encontrado:", pokemonData);
        } catch (error) {
            console.error(error.message);
            UI.showMessage(`Error: ${error.message}`, 'error');
        }
    },

    addPokemon(pokemonData) {
        if (StorageManager.pokemonExists(pokemonData.id)) {
            console.warn("Este Pokémon ya está en la lista");
            UI.showMessage("Este Pokémon ya está en la lista", 'warning');
            return;
        }

        const pokemon = {
            name: pokemonData.name,
            id: pokemonData.id
        };

        StorageManager.addPokemon(pokemon);

        UI.clearPreview();
        UI.clearInput();

        console.log("Pokémon agregado:", pokemon);

        this.refreshList();
    },

    refreshList() {
        const pokemons = StorageManager.getPokemons();
        UI.renderPokeList(pokemons);
    },

    refreshInvokedList() {
        const invoked = StorageManager.getInvokedPokemons();
        UI.renderInvokedList(invoked);
    },

    invokePokemon(pokemonId, pokemonName) {
        const pokemon = {
            id: pokemonId,
            name: pokemonName
        };

        StorageManager.addInvokedPokemon(pokemon);
        console.log("Pokémon invocado:", pokemon);

        this.refreshInvokedList();
    },

    removeInvokedPokemon(uniqueId) {
        StorageManager.removeInvokedPokemon(uniqueId);
        console.log("Pokémon eliminado de invocados:", uniqueId);

        this.refreshInvokedList();
    },

    clearPokemonList() {
        if (confirm('¿Estás seguro de que quieres limpiar la lista de Pokémon guardados?')) {
            StorageManager.clearPokemons();
            this.refreshList();
            console.log("Lista de Pokémon limpiada");
        }
    },

    clearInvokedList() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los Pokémon invocados?')) {
            StorageManager.clearInvokedPokemons();
            this.refreshInvokedList();
            console.log("Lista de invocados limpiada");
        }
    },

    async startBattle() {
        const invokedPokemons = StorageManager.getInvokedPokemons();

        // Validar que haya al menos 2 Pokémon
        if (invokedPokemons.length < 2) {
            const message = UI.renderNoBattle('Necesitas al menos 2 Pokémon invocados para comenzar una batalla.');
            UI.showBattleModal(message);
            return;
        }

        // Seleccionar dos Pokémon aleatorios
        const fighter1Index = Math.floor(Math.random() * invokedPokemons.length);
        let fighter2Index;
        do {
            fighter2Index = Math.floor(Math.random() * invokedPokemons.length);
        } while (fighter2Index === fighter1Index);

        const fighter1 = invokedPokemons[fighter1Index];
        const fighter2 = invokedPokemons[fighter2Index];

        try {
            // Obtener datos completos de ambos Pokémon
            const fighter1Data = await PokemonAPI.getPokemon(fighter1.name || fighter1.id);
            const fighter2Data = await PokemonAPI.getPokemon(fighter2.name || fighter2.id);

            // Preparar datos de combate
            const f1 = {
                name: fighter1Data.name,
                hp: fighter1Data.stats.find(s => s.stat.name === 'hp').base_stat,
                attack: fighter1Data.stats.find(s => s.stat.name === 'attack').base_stat,
                defense: fighter1Data.stats.find(s => s.stat.name === 'defense').base_stat,
                speed: fighter1Data.stats.find(s => s.stat.name === 'speed').base_stat,
                types: fighter1Data.types.map(t => t.type.name).join(', '),
                image: fighter1Data.sprites.front_default
            };

            const f2 = {
                name: fighter2Data.name,
                hp: fighter2Data.stats.find(s => s.stat.name === 'hp').base_stat,
                attack: fighter2Data.stats.find(s => s.stat.name === 'attack').base_stat,
                defense: fighter2Data.stats.find(s => s.stat.name === 'defense').base_stat,
                speed: fighter2Data.stats.find(s => s.stat.name === 'speed').base_stat,
                types: fighter2Data.types.map(t => t.type.name).join(', '),
                image: fighter2Data.sprites.front_default
            };

            // Simular batalla
            const { battleLog, winner } = this.simulateBattle(f1, f2);

            // Mostrar resultado
            const battleResult = UI.renderBattleResult(f1, f2, battleLog, winner);
            UI.showBattleModal(battleResult);

        } catch (error) {
            console.error('Error en la batalla:', error);
            const message = UI.renderNoBattle('Ocurrió un error al cargar los datos de los Pokémon.');
            UI.showBattleModal(message);
        }
    },

    simulateBattle(fighter1, fighter2) {
        const battleLog = [];
        let f1HP = fighter1.hp;
        let f2HP = fighter2.hp;
        const f1MaxHP = fighter1.hp;
        const f2MaxHP = fighter2.hp;

        // Mensajes de ataque variados
        const attackMessages = [
            'lanza un poderoso ataque contra',
            'embiste ferozmente a',
            'usa sus habilidades contra',
            'ataca con furia a',
            'lanza un golpe devastador a',
            'se abalanza sobre',
            'ejecuta un movimiento crítico contra'
        ];

        const criticalMessages = [
            '¡Golpe crítico!',
            '¡Impacto devastador!',
            '¡Ataque súper efectivo!',
            '¡Golpe perfecto!'
        ];

        const dodgeMessages = [
            'esquiva parcialmente el ataque',
            'amortigua el golpe',
            'se defiende del ataque'
        ];

        battleLog.push(`<strong>BATALLA POKÉMON</strong>`);
        battleLog.push(`${fighter1.name.toUpperCase()} (${fighter1.types}) VS ${fighter2.name.toUpperCase()} (${fighter2.types})`);
        battleLog.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // Determinar quién ataca primero por velocidad
        let fighter1First = fighter1.speed >= fighter2.speed;

        if (fighter1First) {
            battleLog.push(`⚡ ${fighter1.name} es más rápido y ataca primero! (SPD: ${fighter1.speed} vs ${fighter2.speed})`);
        } else {
            battleLog.push(`⚡ ${fighter2.name} es más rápido y ataca primero! (SPD: ${fighter2.speed} vs ${fighter1.speed})`);
        }
        battleLog.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        let round = 1;

        while (f1HP > 0 && f2HP > 0) {
            battleLog.push(`\n<strong>⚔️ RONDA ${round} ⚔️</strong>`);

            let attacker, defender, attackerName, defenderName;
            let attackerHP, defenderHP;

            // Alternar entre luchadores
            if (fighter1First) {
                attacker = fighter1;
                defender = fighter2;
                attackerName = fighter1.name;
                defenderName = fighter2.name;
                attackerHP = f1HP;
                defenderHP = f2HP;
            } else {
                attacker = fighter2;
                defender = fighter1;
                attackerName = fighter2.name;
                defenderName = fighter1.name;
                attackerHP = f2HP;
                defenderHP = f1HP;
            }

            // Calcular daño con más variabilidad
            const baseDamage = Math.max(5, attacker.attack - defender.defense * 0.4);
            const variance = Math.random() * 20 - 5; // -5 a +15
            let damage = Math.floor(baseDamage + variance);

            // Probabilidad de crítico (15%)
            const isCritical = Math.random() < 0.15;
            if (isCritical) {
                damage = Math.floor(damage * 1.5);
            }

            // Probabilidad de esquivar parcialmente (20%)
            const isDodged = Math.random() < 0.20;
            if (isDodged && !isCritical) {
                damage = Math.floor(damage * 0.7);
            }

            defenderHP -= damage;

            // Mensaje de ataque
            const attackMsg = attackMessages[Math.floor(Math.random() * attackMessages.length)];
            battleLog.push(`<span class="attack">${attackerName.toUpperCase()}</span> ${attackMsg} <strong>${defenderName}</strong>!`);

            // Mensaje de resultado
            if (isCritical) {
                const critMsg = criticalMessages[Math.floor(Math.random() * criticalMessages.length)];
                battleLog.push(`<span class="damage">${critMsg} Daño: ${damage}</span>`);
            } else if (isDodged) {
                const dodgeMsg = dodgeMessages[Math.floor(Math.random() * dodgeMessages.length)];
                battleLog.push(`${defenderName} ${dodgeMsg}. Daño reducido: ${damage}`);
            } else {
                battleLog.push(`<span class="damage">Daño causado: ${damage}</span>`);
            }

            // Actualizar HP
            if (fighter1First) {
                f2HP = Math.max(0, defenderHP);
            } else {
                f1HP = Math.max(0, defenderHP);
            }

            // Mostrar HP restante con barra visual
            const defenderHPPercent = Math.max(0, Math.floor((defenderHP / (fighter1First ? f2MaxHP : f1MaxHP)) * 100));
            let hpBar = '';
            if (defenderHPPercent > 50) {
                hpBar = '🟢';
            } else if (defenderHPPercent > 25) {
                hpBar = '🟡';
            } else if (defenderHPPercent > 0) {
                hpBar = '🔴';
            } else {
                hpBar = '💀';
            }

            battleLog.push(`${hpBar} ${defenderName} HP: ${Math.max(0, defenderHP)}/${fighter1First ? f2MaxHP : f1MaxHP} (${defenderHPPercent}%)`);

            // Verificar si el defensor fue derrotado
            if (defenderHP <= 0) {
                battleLog.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                battleLog.push(`<strong>${defenderName.toUpperCase()}</strong> ha sido derrotado!`);
                battleLog.push(`${attackerName.toUpperCase()} aún tiene ${attackerHP} HP restantes!`);
                break;
            }

            // Añadir algo de dramatismo
            if (defenderHP < (fighter1First ? f2MaxHP : f1MaxHP) * 0.3 && defenderHP > 0) {
                battleLog.push(`${defenderName} está en problemas...`);
            }

            // Cambiar turno
            fighter1First = !fighter1First;
            round++;

            // Límite de seguridad
            if (round > 30) {
                battleLog.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                battleLog.push('⏱¡La batalla es muy intensa! Se decide por HP restante.');
                const winner = f1HP > f2HP ? fighter1.name : fighter2.name;
                battleLog.push(`${winner.toUpperCase()} gana por resistencia!`);
                return { battleLog, winner };
            }
        }

        const winner = f1HP > 0 ? fighter1.name : fighter2.name;
        battleLog.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        battleLog.push(`🎊 ¡BATALLA TERMINADA EN ${round} RONDAS! 🎊`);

        return { battleLog, winner };
    },

    setupEventListeners() {
        // Event delegation para botones de invocar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-invoke')) {
                const pokemonId = parseInt(e.target.dataset.id);
                const pokemonName = e.target.dataset.name;
                this.invokePokemon(pokemonId, pokemonName);
            }

            // Event delegation para botones de eliminar
            if (e.target.classList.contains('btn-remove')) {
                const uniqueId = e.target.dataset.uniqueId;
                this.removeInvokedPokemon(uniqueId);
            }
        });

        // Botón de búsqueda
        UI.elements.buttonSearch.addEventListener('click', () => this.searchPokemon());

        // Botón de limpiar lista de guardados
        UI.elements.clearListBtn.addEventListener('click', () => this.clearPokemonList());

        // Botón de limpiar lista de invocados
        UI.elements.clearInvokedBtn.addEventListener('click', () => this.clearInvokedList());

        // Botón de combate
        UI.elements.battleBtn.addEventListener('click', () => this.startBattle());
    },

    init() {
        StorageManager.init();
        UI.init();

        const pokemons = StorageManager.getPokemons();
        if (pokemons.length > 0) {
            UI.renderPokeList(pokemons);
        }

        const invoked = StorageManager.getInvokedPokemons();
        if (invoked.length > 0) {
            UI.renderInvokedList(invoked);
        }

        this.setupEventListeners();
    }
};