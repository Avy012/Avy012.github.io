const researchNoteModal = document.getElementById("research-note-modal");
const researchNoteTrigger = document.querySelector('[data-open-modal="research-note-modal"]');
const researchNoteTitle = document.getElementById("research-note-title");
const researchNoteContent = researchNoteModal.querySelector(".research-note-content");
const researchNoteLanguages = researchNoteModal.querySelectorAll("[data-language-button]");

const researchNoteDirectory = "../assets/projects/research-note/";
const researchNoteFiles = new Map();
const researchNoteLabels = {
    en: {
        title: "Research Note",
        references: "References",
        loading: "Loading the research note…",
        error: "The research note could not be loaded.",
        source: "Open the text file"
    },
    ko: {
        title: "연구 노트",
        references: "참고문헌",
        loading: "연구 노트를 불러오는 중입니다…",
        error: "연구 노트를 불러오지 못했습니다.",
        source: "텍스트 파일 열기"
    }
};
let researchNoteLanguage = "en";

function readResearchNoteFile(filename) {
    if (!researchNoteFiles.has(filename)) {
        const request = fetchTextContent(researchNoteDirectory + filename)
            .catch((error) => {
                researchNoteFiles.delete(filename);
                throw error;
            });
        researchNoteFiles.set(filename, request);
    }
    return researchNoteFiles.get(filename);
}

// The text files use Markdown headings, paragraphs, bold text, and reference autolinks.
function renderResearchNote(text, references, labels) {
    const [title, ...blocks] = text.trim().split(/\r?\n\s*\r?\n/);
    researchNoteTitle.textContent = title.replace(/^# /, "");
    const content = document.createDocumentFragment();

    for (const block of blocks) {
        if (block.startsWith("## ")) {
            const heading = document.createElement("h3");
            heading.textContent = block.slice(3);
            content.append(heading);
            continue;
        }
        content.append(renderTextParagraph(block));
    }

    const referencesHeading = document.createElement("h3");
    referencesHeading.textContent = labels.references;
    const referenceList = document.createElement("ul");
    referenceList.className = "research-note-references";
    referenceList.lang = "en";

    for (const item of references.trim().split(/\r?\n\s*\r?\n/)) {
        const entry = document.createElement("li");
        const reference = item.replace(/^- /, "");
        const match = reference.match(/^(?<citation>[\s\S]+) <(?<url>https?:\/\/[^<>\s]+)>$/);
        if (match) {
            const { citation, url } = match.groups;
            const link = document.createElement("a");
            link.href = url;
            link.textContent = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            entry.append(citation, " ", link);
        } else {
            entry.textContent = reference;
        }
        referenceList.append(entry);
    }

    content.append(referencesHeading, referenceList);
    researchNoteContent.replaceChildren(content);
}

async function showResearchNote(language) {
    researchNoteLanguage = language;
    const labels = researchNoteLabels[language];
    const filename = `${language}.txt`;

    for (const button of researchNoteLanguages) {
        const selected = button.dataset.languageButton === language;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    }

    researchNoteTitle.lang = language;
    researchNoteTitle.textContent = labels.title;
    researchNoteContent.lang = language;
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = labels.loading;
    researchNoteContent.replaceChildren(status);

    try {
        const [text, references] = await Promise.all([
            readResearchNoteFile(filename),
            readResearchNoteFile("references.txt")
        ]);
        if (researchNoteLanguage === language) {
            renderResearchNote(text, references, labels);
        }
    } catch {
        if (researchNoteLanguage === language) {
            const source = document.createElement("a");
            source.href = researchNoteDirectory + filename;
            source.textContent = labels.source;
            status.replaceChildren(labels.error, " ", source);
        }
    }
}

function closeResearchNote() {
    researchNoteModal.hidden = true;
    document.body.classList.remove("modal-open");
    researchNoteTrigger.focus();
}

researchNoteTrigger.addEventListener("click", () => {
    researchNoteModal.hidden = false;
    document.body.classList.add("modal-open");
    researchNoteModal.querySelector(".project-modal-close").focus();
    showResearchNote(researchNoteLanguage);
});

for (const button of researchNoteModal.querySelectorAll("[data-close-modal]")) {
    button.addEventListener("click", closeResearchNote);
}

for (const button of researchNoteLanguages) {
    button.addEventListener("click", () => showResearchNote(button.dataset.languageButton));
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !researchNoteModal.hidden) {
        closeResearchNote();
    }
});
