const aboutContent = document.getElementById("about-content");
const aboutSource = aboutContent.querySelector("a");

fetchTextContent(aboutSource.href)
    .then((text) => {
        const paragraphs = text.trim().split(/\r?\n\s*\r?\n/);
        aboutContent.replaceChildren(...paragraphs.map(renderTextParagraph));
    })
    .catch(() => {
        aboutSource.before("The introduction could not be loaded. ");
    });
