const textContentDirectory = new URL(".", document.currentScript.src);
let textContentFallback;

function loadTextContentFallback() {
    if (!textContentFallback) {
        textContentFallback = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = new URL("text-content-fallback.js", textContentDirectory).href;
            script.onload = () => resolve(globalThis.siteTextFallback);
            script.onerror = () => {
                script.remove();
                reject(new Error("Could not load the bundled site content"));
            };
            document.head.append(script);
        }).catch((error) => {
            textContentFallback = null;
            throw error;
        });
    }
    return textContentFallback;
}

async function fetchTextContent(url) {
    const source = new URL(url, document.baseURI);
    if (source.protocol !== "file:") {
        try {
            const response = await fetch(source);
            if (response.ok) {
                return await response.text();
            }
        } catch {
            // Static previews can still read the bundled copy.
        }
    }

    if (source.href.startsWith(textContentDirectory.href)) {
        const bundled = await loadTextContentFallback();
        const filename = source.pathname.slice(textContentDirectory.pathname.length);
        if (bundled && Object.hasOwn(bundled, filename)) {
            return bundled[filename].join("\n");
        }
    }
    throw new Error(`Could not load ${source.href}`);
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
