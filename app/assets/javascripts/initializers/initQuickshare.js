function QSFBEmbedParse(timeout = 2000) {
    setTimeout(() => {
        const fbPostNotRendered = document.querySelectorAll('.fb-post:not([fb-xfbml-state="rendered"])');
        const fbVideoNotRendered = document.querySelectorAll('.fb-video:not([fb-xfbml-state="rendered"])');
        if (fbPostNotRendered.length || fbVideoNotRendered.length) {
            // eslint-disable-next-line no-undef
            FB.XFBML.parse();
        }
    }, timeout);
}

function nsfwImageFixLink() {
    var nsfwImages = document.querySelectorAll('.nsfw-content');
    for (let nsfwImage of nsfwImages) {
        let a = nsfwImage.parentElement;
        
        if (a.tagName != 'A') {
            continue
        }

        if (a.dataset.href) {
            continue
        }

        a.dataset.href = a.href;
        a.setAttribute("href","javascript:void(0);");
    }
}

function nsfwImageClick(e) {
    let target = e.target;
    let parent = e.target.parentElement;

    let isNsfw = target.classList.contains('nsfw-content');
    if (!isNsfw) {
        return
    }

    e.preventDefault();
    e.stopPropagation();

    target.classList.remove('nsfw-content');
    parent.setAttribute("href", parent.dataset.href);
}

function nsfwParse() {
    nsfwImageFixLink();
    document.addEventListener('click', nsfwImageClick);
}