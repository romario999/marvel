import { useHttp } from "../hooks/http.hook";

const useMarvelService = () => {
    const { request, clearError, process, setProcess } = useHttp();

    const _apiBase = "https://gateway.marvel.com:443/v1/public/";
    const _apiKey = "apikey=c5d6fc8b83116d92ed468ce36bac6c62";
    const _baseOffset = 210;

    const getAllCharacters = async (offset = _baseOffset, limit = 20) => {
        try {
            const res = await request(
                `${_apiBase}characters?limit=${limit}&offset=${offset}&${_apiKey}`
            );
            
            const filteredCharacters = res.data.results.filter(character => 
                character.thumbnail && !character.thumbnail.path.includes('image_not_available') && !character.thumbnail.extension.includes('gif')
            );
            // Якщо після фільтрації залишилося менше 9 персонажів, запитуємо більше
            while (filteredCharacters.length < 9 && res.data.results.length === limit) {
                offset += limit;
                const additionalRes = await request(
                    `${_apiBase}characters?limit=${limit}&offset=${offset}&${_apiKey}`
                );
                const additionalFilteredCharacters = additionalRes.data.results.filter(character => 
                    character.thumbnail && !character.thumbnail.path.includes('image_not_available')
                );
                filteredCharacters.push(...additionalFilteredCharacters);
            }
            
            const limitedCharacters = filteredCharacters.slice(0, 9);
            
            return limitedCharacters.map(_transformCharacter);
        } catch (error) {
            console.error("Error fetching characters:", error);
            throw error; // повторно кинути помилку, щоб обробляти її на вищому рівні
        }
    };
    
    

    const getCharacterByName = async (name) => {
        const res = await request(`${_apiBase}characters?name=${name}&${_apiKey}`);
        return res.data.results.map(_transformCharacter);
    };

    const getCharacter = async (id) => {
        const res = await request(`${_apiBase}characters/${id}?${_apiKey}`);
        return _transformCharacter(res.data.results[0]);
    };

    const getAllComics = async (offset = 0) => {
      //  const res = await request(
        //    `${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}`
       // );
       // return res.data.results.map(_transformComics);

       try {
        const res = await request(
            `${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}` );
        
        const filteredComics = res.data.results.filter(comics => 
            comics.thumbnail && !comics.thumbnail.path.includes('image_not_available') && !comics.thumbnail.extension.includes('gif')
        );

        while (filteredComics.length < 8 && res.data.results.length === 8) {
            offset += 8;
            const additionalRes = await request(
                `${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}` 
            );
            const additionalFilteredComics = additionalRes.data.results.filter(comics => 
                comics.thumbnail && !comics.thumbnail.path.includes('image_not_available')
            );
            filteredComics.push(...additionalFilteredComics);
        }
        
        const limitedComics = filteredComics.slice(0, 8);
        
        return limitedComics.map(_transformComics);
    } catch (error) {
        console.error("Error fetching characters:", error);
        throw error; // повторно кинути помилку, щоб обробляти її на вищому рівні
    }
    };

    const getComic = async (id) => {
        const res = await request(`${_apiBase}comics/${id}?${_apiKey}`);
        return _transformComics(res.data.results[0]);
    };

    const getCharacterPhotoAndName = async () => {
        const res = await request(`${_apiBase}characters?limit=100&${_apiKey}`);
        return res.data.results
            .filter(character => character.thumbnail && !character.thumbnail.path.includes('image_not_available'))
            .map(character => ({
                name: character.name,
                thumbnail: `${character.thumbnail.path}.${character.thumbnail.extension}`
            }));
    };

    const _transformCharacter = (char) => {
        return {
            id: char.id,
            name: char.name,
            description: char.description
                ? `${char.description.slice(0, 210)}...`
                : "There is no description for this character",
            thumbnail: char.thumbnail.path + "." + char.thumbnail.extension,
            homepage: char.urls[0].url,
            wiki: char.urls[1].url,
            comics: char.comics.items,
        };
    };

    const _transformComics = (comics) => {
        return {
            id: comics.id,
            title: comics.title,
            description: comics.description || "There is no description",
            pageCount: comics.pageCount
                ? `${comics.pageCount} p.`
                : "No information about the number of pages",
            thumbnail: comics.thumbnail.path + "." + comics.thumbnail.extension,
            language: comics.textObjects[0]?.language || "en-us",
            price: comics.prices[0].price
                ? `${comics.prices[0].price}$`
                : "not available",
        };
    };

    return {
        clearError,
        process,
        setProcess,
        getAllCharacters,
        getCharacterByName,
        getCharacter,
        getAllComics,
        getComic,
        getCharacterPhotoAndName
    };
};

export default useMarvelService;
