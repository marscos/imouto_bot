const fetch = require('node-fetch');

const query = `
query ($title: String) { 
  Page (page:1, perPage: 5) {
    SERIES: media (search: $title, sort: SEARCH_MATCH) { 
        title {
          english
          romaji
          native
        }
        type
        status
        episodes
        chapters
        genres
        description(asHtml: true)
        coverImage {
            medium
            large
        }
        meanScore
        siteUrl
      }
  }
}
`
const url = 'https://graphql.anilist.co'

function getMessageText(media) { 
    return `<b>${media.title.english?media.title.english:media.title.native} (${media.title.romaji})</b> ♦ ${media.type}<br/>
        <i>${media.genres.join(", ")}</i><br/>
        ${media.status} → ${media.type=='MANGA'?(media.chapters==null?'???':media.chapters):media.episodes} ${media.type=='MANGA'?'Chapters':'Episodes'}<br/>
        Mean Score: <b>${media.meanScore}</b><br/><br/>
        
        ${media.description}`
}

async function getSearchResults(title) {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: {title}
        })
    }

    try {
        const response = await fetch(url, options)
        const data = await handleResponse(response)
        const results = handleData(data)
        return results
    } catch(error) {
        handleError(error)
    }     
}

function handleResponse(response) {
    return response.json().then( (json) => {
        return response.ok ? json : Promise.reject(json)
    })
}

function handleData(data) {
    let results = data.data.Page.SERIES.map((media, index) => {
        return {
            type: "article",
            id: index,
            title: media.title.english+" ♦ "+media.type,
            description: media.description,
            url: media.siteUrl,
            hide_url: true,
            thumb_url: media.coverImage.large,
            input_message_content: {
                message_text: getMessageText(media),
                parse_mode: "HTML"
            }
        }
    })
    return results
}

function handleError(error) {
    console.error(error)
}

module.exports = getSearchResults