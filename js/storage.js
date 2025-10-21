/**
 * Manejo del localStorage
 */
export const StorageManager = {
    STORAGE_KEY: 'pokes',
    INVOKED_KEY: 'invoked_pokes',

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.INVOKED_KEY)) {
            localStorage.setItem(this.INVOKED_KEY, JSON.stringify([]));
        }
    },

    getPokemons() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    },

    savePokemons(pokemons) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pokemons));
    },

    addPokemon(pokemon) {
        const pokemons = this.getPokemons();
        pokemons.push(pokemon);
        this.savePokemons(pokemons);
    },

    pokemonExists(pokemonId) {
        const pokemons = this.getPokemons();
        return pokemons.some(poke => poke.id === pokemonId);
    },

    clearPokemons() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    },

    // Funciones para Pokémon invocados
    getInvokedPokemons() {
        return JSON.parse(localStorage.getItem(this.INVOKED_KEY)) || [];
    },

    saveInvokedPokemons(pokemons) {
        localStorage.setItem(this.INVOKED_KEY, JSON.stringify(pokemons));
    },

    addInvokedPokemon(pokemon) {
        const invoked = this.getInvokedPokemons();
        // Agregar timestamp único para permitir duplicados
        const invokedPokemon = {
            ...pokemon,
            invokedAt: Date.now(),
            uniqueId: `${pokemon.id}-${Date.now()}`
        };
        invoked.push(invokedPokemon);
        this.saveInvokedPokemons(invoked);
    },

    removeInvokedPokemon(uniqueId) {
        const invoked = this.getInvokedPokemons();
        const filtered = invoked.filter(poke => poke.uniqueId !== uniqueId);
        this.saveInvokedPokemons(filtered);
    },

    clearInvokedPokemons() {
        localStorage.setItem(this.INVOKED_KEY, JSON.stringify([]));
    }
};