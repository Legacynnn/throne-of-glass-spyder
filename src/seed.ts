import axios from 'axios'
import cheerio from 'cheerio'
import mysql from 'mysql'

const connectionString = "mysql://Legacyn:Folhas1234@localhost:3306/throne"
const connection = mysql.createConnection(connectionString)
connection.connect()

const getCharacterPageNames = async () => {
    const url = "https://throneofglass.fandom.com/wiki/Category:Kingdom_of_Ash_characters"
    const {data} = await axios.get(url)
    const $ = cheerio.load(data)
    const categories = $('ul.category-page__members-for-char')

    const charactersPageNames = []
    for(let i = 0; i < categories.length; i++) {
        const ul = categories[i]
        const characterLIs = $(ul).find('li.category-page__member')
        for(let j = 0; j < characterLIs.length; j++) {
            const li = characterLIs[j]
            const path = $(li).find('a.category-page__member-link').attr('href') || ''
            const name = path.replace('/wiki/', "")
            charactersPageNames.push(name)
            console.log(name)
        }
    }

    return charactersPageNames
}

const getCharacterInfo = async (characterName: string) => {
    const url = "https://throneofglass.fandom.com/wiki/" + characterName
    const {data} = await axios.get(url)
    const $ = cheerio.load(data)

    let name = $('h2[data-source="name"]').text()
    const species = $('div[data-source="species"] > div.pi-data-value.pi-font').text
    const image = $('.image.image-thumbnail > img').attr('src')

    if(!name) {
        name = characterName.replace('_', '')
    }
    const characterInfo = {
        name, species, image
    }
    return characterInfo
}

const loadCharacter = async () => {
    const characterPageNames = await getCharacterPageNames()
    const characterInfoPromise = characterPageNames.map((characterName: string) => getCharacterInfo(characterName))
    const characters = await Promise.all(characterInfoPromise);
    const values = characters.map((character: { name: any; species: any; image: any }, i: any) => [i, character.name, character.species, character.image]);
    console.log(values);
    const sql = 'INSERT INTO characters (id, name, species, image) VALUES ?';
    connection.query(sql, [values], (err) => {
    if (err) {
        return console.error(err);
    }
    console.log('YAYY');
    });
}


//getCharacterPageNames()
loadCharacter()