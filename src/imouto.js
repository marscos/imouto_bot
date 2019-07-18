const fetch = require('node-fetch');

const query = `
query ($offset: Int, $title: String) { 
  Page (page: $offset, perPage: 8) {
    SERIES: media (search: $title, sort: SEARCH_MATCH) { 
        id
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
    return `<b>${media.title.english?media.title.english:media.title.native?media.title.native:media.title.romaji} ${(media.title.english||media.title.native)&&media.title.english!==media.title.romaji?"("+media.title.romaji+")":""}</b>
<i>${media.genres.join(", ")}</i>
${media.status} → ${media.type=='MANGA'?(media.chapters==null?'???':media.chapters):media.episodes} ${media.type=='MANGA'?'Chapters':'Episodes'}
Mean Score: <b>${media.meanScore}</b> <a href="${media.coverImage.large}">(</a><a href="${media.siteUrl}">AniList)</a>

${cleanHTMLFromText(media.description)}`
}

function cleanHTMLFromText(text) {
    return text.replace(/<(?:.|\n)*?>/gm, '')
}

// Offset in inline query request is used as graphql query page
async function getSearchResults(offset, title) {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: {offset, title}
        })
    }

    try {
        const response = await fetch(url, options)
        const data = await handleAniListResponse(response)
        const results = handleAniListResponseData(data)
        return results
    } catch(error) {
        handleError(error)
    }     
}

function handleAniListResponse(response) {
    return response.json().then( (json) => {
        return response.ok ? json : Promise.reject(json)
    })
}

// Digest AniList response data, returning it as a Telegram inline query results object
function handleAniListResponseData(data) {
    let results = data.data.Page.SERIES.map((media) => {
        return {
            type: "article",
            id: media.id,
            title: `[${media.type}] ${media.title.english?media.title.english:media.title.romaji}`,
            description: cleanHTMLFromText(media.description),
            url: media.siteUrl,
            hide_url: true,
            thumb_url: media.coverImage.large,
            thumb_width: 373,
            thumb_height: 567,
            input_message_content: {
                message_text: getMessageText(media),
                parse_mode: "HTML"
            }
        }
    })
    return results
}

function handleError(error) { // TODO
    console.error(error)
}

module.exports = getSearchResults