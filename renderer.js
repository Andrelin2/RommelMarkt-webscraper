const { parse } = require("node-html-parser")

const baseUrl = "https://rommelmarktvandaag.nl"

const getPage = async (url) => {

    return fetch(url).then(async res => { return await res.text() })
}



const getLinks = async (html) => {

    const roots = []

    const startString = "/event/"

    const endString = "/\""

    let startIndex = html.indexOf(startString)

    let endIndex = html.indexOf(endString, startIndex)

    let root = ""

    while (true) {
        root = html.substring(startIndex, endIndex)
        if (root.includes("html")) {
            break
        }
        roots.push(baseUrl + root)
        startIndex = html.indexOf(startString, endIndex)
        endIndex = html.indexOf(endString, startIndex)

    }

    return roots
}

const getDates = (dateStart, dateEnd) => {
    datesList = []

    const options = { day: "2-digit", month: "2-digit", year: "numeric" }

    dateStartYear = dateStart.split("-")[0]
    dateStartMonth = dateStart.split("-")[1]
    dateStartDay = dateStart.split("-")[2]

    dateEndYear = dateEnd.split("-")[0]
    dateEndMonth = dateEnd.split("-")[1]
    dateEndDay = dateEnd.split("-")[2]

    const start = new Date(dateStartYear, dateStartMonth - 1, dateStartDay).toLocaleDateString("nl-NL", options)
    const end = new Date(dateEndYear, dateEndMonth - 1, +dateEndDay + 1).toLocaleDateString("nl-NL", options)

    let date = new Date(dateStartYear, dateStartMonth - 1, dateStartDay)

    while (true) {
        datesList.push(date.toLocaleDateString("nl-NL", options))
        date.setDate(date.getDate() + 1)
        if (end == date.toLocaleDateString("nl-NL", options)) {
            break
        }
    }

    return datesList

}

const getEventData = async (linksList) => {
    const eventDataList = []
    count = 0
    for (link of linksList) {

        const html = await getPage(link)

        let eventName = html.match(/<h1>(.*?)\/h1>/mgs)?.[0]
        let eventDate = html.match(/<div class="date">(.*?)<\/div>/gm)?.[0]
        let eventStart = html.match(/<li><label>Aanvang:<\/label><span>(.*?)<\/span><\/li>/gm)?.[0]
        let eventEnd = html.match(/<li><label>Einde:<\/label><span>(.*?)<\/span><\/li>/gm)?.[0]
        let eventDesc = html.match(/<div class="desc(.*?)<\/div>/smg)?.[0]
        let eventMaps = html.match(/https:\/\/maps\.google(.*?)"/smg)?.[0]
        let eventContact = html.match(/<li><label>Contact(.*?)<\/li>/gm)?.[0]
        let eventLocation = html.match(/<span class="address"><label>(.*?)<\/label>/smg)?.[0]

        eventName = eventName ? parse(eventName).innerText : "?????"
        eventDate = eventDate ? parse(eventDate).innerText : "?????"
        eventStart = eventStart ? parse(eventStart).innerText : "?????"
        eventEnd = eventEnd ? parse(eventEnd).innerText : "?????"
        eventDesc = eventDesc ? parse(eventDesc).innerText : "?????"
        eventMaps = eventMaps ? eventMaps.slice().replace("\"", "") : "?????"
        eventContact = eventContact ? parse(eventContact).innerText : "?????"
        eventLocation = eventLocation ? parse(eventLocation).innerText : "?????"

        if (eventContact.includes("ontact")) {
            eventContact.split(":")[1]
        }

        eventDataList.push(decodeHTMLEntities(
            
`
<p id="line">
<br>
Name: ${eventName} <br><br>
Date: ${eventDate} <br><br>
${eventStart} <br><br>
${eventEnd} <br><br>
Desc: ${eventDesc} <br><br>
<a target="_blank" href="${eventMaps}">Google Map</a> <br><br>
Contact: ${eventContact} <br><br>
Location: ${eventLocation} <br><br><br>
</p>
`
        ))

        showData(eventDataList[count])

        count++
        console.log(link)
        await sleep(0.5)

        /* const results = eventName + "<\br>"
        eventDate + "<\br>"
        eventStart + "<\br>"
        eventEnd + "<\br>"
        eventDesc + "<\br>"
        eventMaps + "<\br>"
        eventContact + "<\br>"
        eventLocation + "<\br>" */

        /* document.getElementById("results").innerHTML = results */
        /* fs.appendFileSync("eventData", "Name: " + eventName + "\n")
        fs.appendFileSync("eventData", "Date: " + eventDate + "\n")
        fs.appendFileSync("eventData", eventStart + "\n")
        fs.appendFileSync("eventData", eventEnd + "\n")
        fs.appendFileSync("eventData", "Desc: " + eventDesc + "\n")
        fs.appendFileSync("eventData", "Maps: " + eventMaps + "\n")
        fs.appendFileSync("eventData", "Contact: " + eventContact + "\n")
        fs.appendFileSync("eventData", "Location: " + eventLocation + "\n")
        fs.appendFileSync("eventData", "\n") */
    }
    return dict

}

function decodeHTMLEntities(html) {
    // Create a new DOMParser
    const parser = new DOMParser();
    // Parse the HTML string into a Document
    const doc = parser.parseFromString(html, 'text/html');
    // Use innerHTML of the document's body to get the decoded HTML with tags intact
    return doc.body.innerHTML;
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

const main = async (dateStart, dateEnd) => {

    const dates = getDates(dateStart, dateEnd)

    const linksList = []

    for (let date of dates) {
        const url = baseUrl + "/" + String(date)
        const html = await getPage(url)

        const links = await getLinks(html)

        linksList.push(...links)
    }
    const eventData = await getEventData(linksList)
    return eventData
}

const showData = (eventData) => {
    const results = document.getElementById("results")
    results.innerHTML += eventData
}



const mySearch = async () => {
    const dateStart = document.getElementById("startDate").value
    const dateEnd = document.getElementById("endDate").value

    if (dateStart == "" && dateEnd == "") {
        alert("Invalid date")
    }

    const eventData = await main(dateStart, dateEnd)
    /* showData(eventData) */
}




