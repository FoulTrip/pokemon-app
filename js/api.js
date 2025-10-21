const BASE_URL = 'https://pokeapi.co/api/v2';

export const PokemonAPI = {
    async getPokemon(nameOrId) {
        const url = `${BASE_URL}/pokemon/${nameOrId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Pokémon no encontrado');
        }
        
        const data = await response.json();
        return data;
    }
};