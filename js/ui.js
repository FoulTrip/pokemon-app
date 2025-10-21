import { PokemonAPI } from './api.js';

/**
 * Manejo de la interfaz y renderizado
 */
export const UI = {
    elements: {
        listContainer: null,
        invokedContainer: null,
        inputPokemon: null,
        previewSearch: null,
        buttonSearch: null,
        clearListBtn: null,
        clearInvokedBtn: null,
        battleBtn: null,
        battleModal: null,
        battleResult: null,
        modalClose: null
    },

    init() {
        this.elements.listContainer = document.getElementById('listpokemons');
        this.elements.invokedContainer = document.getElementById('listinvoked');
        this.elements.inputPokemon = document.querySelector('#pokename');
        this.elements.previewSearch = document.getElementById('previewSearch');
        this.elements.buttonSearch = document.getElementById('searchClick');
        this.elements.clearListBtn = document.getElementById('clearListBtn');
        this.elements.clearInvokedBtn = document.getElementById('clearInvokedBtn');
        this.elements.battleBtn = document.getElementById('battleBtn');
        this.elements.battleModal = document.getElementById('battleModal');
        this.elements.battleResult = document.getElementById('battleResult');
        this.elements.modalClose = document.querySelector('.close');

        // Event listener para cerrar modal
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => this.closeModal());
        }

        // Cerrar modal al hacer clic fuera de él
        if (this.elements.battleModal) {
            this.elements.battleModal.addEventListener('click', (e) => {
                if (e.target === this.elements.battleModal) {
                    this.closeModal();
                }
            });
        }
    },

    async renderCardPoke(poke) {
        try {
            // Hacer petición a la API para obtener datos completos del Pokémon
            const pokemonData = await PokemonAPI.getPokemon(poke.name || poke.id);

            // Extraer datos básicos
            const name = pokemonData.name;
            const id = pokemonData.id;
            const types = pokemonData.types.map(t => t.type.name).join(', ');
            const height = pokemonData.height / 10; // convertir a metros
            const weight = pokemonData.weight / 10; // convertir a kg
            const image = pokemonData.sprites.front_default;

            // Extraer habilidades
            const abilities = pokemonData.abilities
                .map(a => a.ability.name)
                .join(', ');

            // Extraer estadísticas de combate
            const stats = pokemonData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const cardId = `poke-card-${id}`;

            // Crear el HTML
            const cardHTML = `
                <div class="poke-item" id="${cardId}">
                    ${image ? `<img src="${image}" alt="${name}">` : ''}
                    <div class="poke-item-content">
                        <h3>${name.toUpperCase()}</h3>
                        <div class="poke-info">
                            <p><strong>ID:</strong> #${id}</p>
                            <p><strong>Tipo:</strong> ${types}</p>
                            <p><strong>Altura:</strong> ${height} m</p>
                            <p><strong>Peso:</strong> ${weight} kg</p>
                        </div>
                        <div class="poke-abilities">
                            <p><strong>Habilidades:</strong> ${abilities}</p>
                        </div>
                        <div class="poke-stats">
                            <h4>Stats de Combate</h4>
                            <div class="stat-bar">
                                <span>HP:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.hp / 255) * 100}%">${stats.hp}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>ATK:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.attack / 255) * 100}%">${stats.attack}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>DEF:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.defense / 255) * 100}%">${stats.defense}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>SPD:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.speed / 255) * 100}%">${stats.speed}</div></div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-invoke" data-id="${id}" data-name="${name}">Invocar</button>
                </div>
            `;

            return cardHTML;
        } catch (error) {
            console.error(`Error al cargar datos de ${poke.name}:`, error);
            return `
                <div class="poke-item">
                    <p>${poke.name}</p>
                    <p style="color: red;">Error al cargar datos</p>
                </div>
            `;
        }
    },

    async renderPokeList(pokemons) {
        if (!this.elements.listContainer) return;

        // Mostrar mensaje de carga
        this.elements.listContainer.innerHTML = `
            <div class="poke-list-container">
                <p>Cargando Pokémon...</p>
            </div>
        `;

        // Esperar a que todas las peticiones se completen
        const pokemonCards = await Promise.all(
            pokemons.map(poke => this.renderCardPoke(poke))
        );

        this.elements.listContainer.innerHTML = `
            <div class="poke-list-container">
                ${pokemonCards.join('')}
            </div>
        `;
    },

    showSearchPreview(pokemonData, onAddClick) {
        this.elements.previewSearch.innerHTML = `
            <div class="prevSearch">
                <p>Resultados</p>
                <div class="bar-search">
                    <div>
                        <p>${pokemonData.name}</p>
                    </div>
                    <div class="buttonAdd">
                        <button id="AddToList">Agregar</button>
                    </div>
                </div>
            </div>
        `;

        const addButton = document.getElementById('AddToList');
        addButton.addEventListener('click', onAddClick);
    },

    showMessage(message, type = 'info') {
        const colors = {
            error: 'red',
            warning: 'orange',
            success: 'green',
            info: 'black'
        };

        this.elements.previewSearch.innerHTML = `
            <div class="prevSearch">
                <p style="color: ${colors[type]};">${message}</p>
            </div>
        `;
    },

    clearPreview() {
        this.elements.previewSearch.innerHTML = '';
    },

    clearInput() {
        this.elements.inputPokemon.value = '';
    },

    getInputValue() {
        return this.elements.inputPokemon.value.trim();
    },

    /**
     * Renderizar tarjeta de Pokémon invocado
     * @param {*} poke 
     * @returns 
     */
    async renderInvokedCard(poke) {
        try {
            // Hacer petición a la API para obtener datos completos del Pokémon
            const pokemonData = await PokemonAPI.getPokemon(poke.name || poke.id);

            // Extraer datos básicos
            const name = pokemonData.name;
            const id = pokemonData.id;
            const types = pokemonData.types.map(t => t.type.name).join(', ');
            const height = pokemonData.height / 10;
            const weight = pokemonData.weight / 10;
            const image = pokemonData.sprites.front_default;

            // Extraer habilidades
            const abilities = pokemonData.abilities
                .map(a => a.ability.name)
                .join(', ');

            // Extraer estadísticas de combate
            const stats = pokemonData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            return `
                <div class="poke-item invoked-item">
                    ${image ? `<img src="${image}" alt="${name}">` : ''}
                    <div class="poke-item-content">
                        <h3>${name.toUpperCase()}</h3>
                        <div class="poke-info">
                            <p><strong>ID:</strong> #${id}</p>
                            <p><strong>Tipo:</strong> ${types}</p>
                            <p><strong>Altura:</strong> ${height} m</p>
                            <p><strong>Peso:</strong> ${weight} kg</p>
                        </div>
                        <div class="poke-abilities">
                            <p><strong>Habilidades:</strong> ${abilities}</p>
                        </div>
                        <div class="poke-stats">
                            <h4>Stats de Combate</h4>
                            <div class="stat-bar">
                                <span>HP:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.hp / 255) * 100}%">${stats.hp}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>ATK:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.attack / 255) * 100}%">${stats.attack}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>DEF:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.defense / 255) * 100}%">${stats.defense}</div></div>
                            </div>
                            <div class="stat-bar">
                                <span>SPD:</span>
                                <div class="bar"><div class="fill" style="width: ${(stats.speed / 255) * 100}%">${stats.speed}</div></div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-remove" data-unique-id="${poke.uniqueId}">✕</button>
                </div>
            `;
        } catch (error) {
            console.error(`Error al cargar datos de ${poke.name}:`, error);
            return `
                <div class="poke-item invoked-item">
                    <p>${poke.name}</p>
                    <p style="color: red;">Error al cargar datos</p>
                </div>
            `;
        }
    },

    /**
     * Renderizar lista de Pokémon invocados
     * @param {*} pokemons 
     * @returns 
     */
    async renderInvokedList(pokemons) {
        if (!this.elements.invokedContainer) return;

        if (pokemons.length === 0) {
            this.elements.invokedContainer.innerHTML = `
                <div class="poke-list-container">
                    <p class="empty-message">No hay Pokémon invocados aún</p>
                </div>
            `;
            return;
        }

        // Mostrar mensaje de carga
        this.elements.invokedContainer.innerHTML = `
            <div class="poke-list-container">
                <p>Cargando Pokémon invocados...</p>
            </div>
        `;

        // Esperar a que todas las peticiones se completen
        const pokemonCards = await Promise.all(
            pokemons.map(poke => this.renderInvokedCard(poke))
        );

        this.elements.invokedContainer.innerHTML = `
            <div class="poke-list-container">
                ${pokemonCards.join('')}
            </div>
        `;
    },

    /**
     * Funciones del modal de batalla
     * @param {*} battleData 
     * @returns 
     */
    showBattleModal(battleData) {
        if (!this.elements.battleModal || !this.elements.battleResult) return;

        this.elements.battleResult.innerHTML = battleData;
        this.elements.battleModal.classList.add('show');
    },

    closeModal() {
        if (!this.elements.battleModal) return;
        this.elements.battleModal.classList.remove('show');
    },

    renderBattleResult(fighter1Data, fighter2Data, battleLog, winner) {
        return `
            <div class="battle-arena">
                <div class="fighter ${winner === fighter1Data.name ? 'winner' : 'loser'}">
                    <img src="${fighter1Data.image}" alt="${fighter1Data.name}">
                    <h3>${fighter1Data.name.toUpperCase()}</h3>
                    <div class="fighter-stats">
                        <p><strong>HP:</strong> ${fighter1Data.hp}</p>
                        <p><strong>ATK:</strong> ${fighter1Data.attack}</p>
                        <p><strong>DEF:</strong> ${fighter1Data.defense}</p>
                        <p><strong>SPD:</strong> ${fighter1Data.speed}</p>
                        <p><strong>Tipo:</strong> ${fighter1Data.types}</p>
                    </div>
                </div>

                <div class="vs-text">VS</div>

                <div class="fighter ${winner === fighter2Data.name ? 'winner' : 'loser'}">
                    <img src="${fighter2Data.image}" alt="${fighter2Data.name}">
                    <h3>${fighter2Data.name.toUpperCase()}</h3>
                    <div class="fighter-stats">
                        <p><strong>HP:</strong> ${fighter2Data.hp}</p>
                        <p><strong>ATK:</strong> ${fighter2Data.attack}</p>
                        <p><strong>DEF:</strong> ${fighter2Data.defense}</p>
                        <p><strong>SPD:</strong> ${fighter2Data.speed}</p>
                        <p><strong>Tipo:</strong> ${fighter2Data.types}</p>
                    </div>
                </div>
            </div>

            <div class="battle-log">
                <h3>Registro de Batalla</h3>
                ${battleLog.map(log => `<p>${log}</p>`).join('')}
            </div>

            <div class="winner-announcement">
                ${winner.toUpperCase()} es el ganador!
            </div>
        `;
    },

    renderNoBattle(message) {
        return `
            <div class="no-battle">
                <p>${message}</p>
            </div>
        `;
    }
};