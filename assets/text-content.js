async function fetchTextContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not load ${url}`);
    }
    return response.text();
}

function renderTextParagraph(text) {
    const paragraph = document.createElement("p");
    const inlineMarkup = /(\*\*[^*]+\*\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;

    for (const [index, part] of text.split(inlineMarkup).entries()) {
        if (index % 2 === 0) {
            paragraph.append(part);
        } else if (part.startsWith("**")) {
            const emphasis = document.createElement("strong");
            emphasis.textContent = part.slice(2, -2);
            paragraph.append(emphasis);
        } else {
            const separator = part.indexOf("](");
            const link = document.createElement("a");
            link.textContent = part.slice(1, separator);
            link.href = part.slice(separator + 2, -1);
            link.className = "subtle-link";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            paragraph.append(link);
        }
    }

    return paragraph;
}
